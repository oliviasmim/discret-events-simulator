// Importações necessárias para o funcionamento da simulação
import { Clock } from './Clock.js';           // Gerenciador de tempo discreto
import { EventBus } from '../core/EventBus.js'; // Sistema de comunicação entre componentes
import { Task } from '../core/Task.js';        // Modelo de processo/tarefa
import FCFS from '../schedulers/fcfs.js';      // Algoritmo First-Come First-Served
import RoundRobin from '../schedulers/rr.js';  // Algoritmo Round Robin
import EDF from '../schedulers/edf.js';        // Algoritmo Earliest Deadline First

// Mapeamento de strings para classes de algoritmos - facilita seleção dinâmica
const ALGO_MAP = { fcfs: FCFS, rr: RoundRobin, edf: EDF };

/**
 * CLASSE SIMULATION - MOTOR PRINCIPAL DO SIMULADOR
 * 
 * Responsável por orquestrar toda a simulação de escalonamento de CPU.
 * Gerencia o ciclo de vida dos processos: chegada, execução, preempção e conclusão.
 */
export class Simulation {
  /**
   * Construtor da simulação
   * @param {string} algo - Algoritmo de escalonamento ('fcfs', 'rr', 'edf')
   * @param {number} quantum - Fatia de tempo para Round Robin (padrão: 3)
   * @param {number} cpuCount - Número de CPUs simuladas (padrão: 1)
   */
  constructor({ algo = 'fcfs', quantum = 3, cpuCount = 1 }) {
    // Sistema de eventos para comunicação entre componentes
    this.bus = new EventBus();
    
    // Instancia o algoritmo escolhido usando Factory Pattern
    this.scheduler = new (ALGO_MAP[algo])(quantum);
    
    // Relógio da simulação - controla o tempo discreto
    this.clock = new Clock();
    
    // Array representando as CPUs - null = CPU livre, Task = CPU ocupada
    this.cpus = Array(cpuCount).fill(null);
    
    this.cpuStartTimes = Array(cpuCount).fill(null); // Controla quando cada tarefa começou em cada CPU
    
    // Array de tarefas finalizadas para cálculo de estatísticas
    this.finished = [];
    
    // listeners - registra callback para o evento de tick do relógio
    this.bus.on('tick', now => this.#onTick(now));
  }

  /**
   * MÉTODO PRINCIPAL DA SIMULAÇÃO - EXECUTADO A CADA TICK
   * 
   * Este método implementa o ciclo principal de um sistema operacional:
   * 1. Chegada de novos processos
   * 2. Execução de processos ativos
   * 3. Escalonamento de próximos processos
   * 4. Preempção (quando aplicável)
   * 
   * @param {number} now - Tempo atual da simulação
   */
  #onTick(now) {
    // 1. alimenta novas chegadas (padrão simulado: Poisson-ish a cada poucos ticks)
    // Simula chegada aleatória de processos - similar ao que acontece em um SO real
    this.#spawnRandomTask(now);
    
    // 2. verifica tarefas em execução
    // Para cada CPU, decrementa o tempo restante da tarefa em execução
    this.cpus.forEach((running, idx) => {
      if (!running) return; // CPU livre - não há nada para processar
      
      // Decrementa 1 unidade de tempo da tarefa atual
      running.remaining -= 1;
      
      // Verifica se a tarefa terminou
      if (running.remaining <= 0) {
        running.finish = now;              // Marca tempo de conclusão
        this.finished.push(running);       // Move para lista de finalizadas
        this.cpus[idx] = null;            // Libera a CPU
        this.cpuStartTimes[idx] = null;   // Limpa o controle da CPU
        this.bus.emit('taskFinish', running); // Notifica conclusão
      }
    });
    
    // 3. escalonamento
    // Para cada CPU livre, tenta agendar uma nova tarefa
    this.cpus.forEach((running, idx) => {
      if (running) return; // CPU ocupada - pula para próxima
      
      // Pede ao escalonador a próxima tarefa a executar
      const next = this.scheduler.next(idx, now);
      if (next) {
        // Se é a primeira vez executando, marca tempo de início
        if (next.start === null) next.start = now;
        
        // Atribui tarefa à CPU
        this.cpus[idx] = next;
        this.cpuStartTimes[idx] = now; // Controla quando esta tarefa começou nesta CPU
        
        // Notifica início de execução
        this.bus.emit('taskStart', { task: next, cpu: idx, now });
      }
    });
    
    // 4. preempção Round-Robin (tempo fixo)
    // Implementa preempção por quantum apenas para algoritmos que suportam
    if (this.scheduler.timeSlice) {
      this.cpus.forEach((running, idx) => {
        if (!running || this.cpuStartTimes[idx] === null) return;
        
        // Calcula há quanto tempo a tarefa está executando nesta CPU
        const runTime = now - this.cpuStartTimes[idx];
        
        // Se excedeu o quantum, faz preempção
        if (runTime >= this.scheduler.timeSlice()) {
          // Emite evento de preempção para melhor visualização
          this.bus.emit('taskPreempted', { task: running, now });
          
          // Preempta a tarefa - volta para fila do escalonador
          this.scheduler.add(running);
          this.cpus[idx] = null;              // Libera CPU
          this.cpuStartTimes[idx] = null;     // Limpa controle de tempo
        }
      });
    }
    
    // Emite estado atual da simulação para componentes de visualização
    this.bus.emit('state', { now, cpus: this.cpus, ready: [...this.scheduler.ready] });
  }

  /**
   * GERADOR DE TAREFAS ALEATÓRIAS
   * 
   * Simula a chegada de novos processos no sistema de forma probabilística.
   * Configurações importantes:
   * - Probabilidade: 30% por tick (0.3)
   * - Duração: Entre 2 e 7 unidades de tempo
   * - Deadline: Duração + folga aleatória entre 2 e 9 unidades
   * 
   * @param {number} now - Tempo atual da simulação
   */
  #spawnRandomTask(now) {
    if (Math.random() > 0.3) return; // 30% de chance a cada tick
    
    // Gera IDs de tarefa mais didáticos
    // Conta total de tarefas já criadas para gerar ID sequencial (P1, P2, P3...)
    const taskCounter = this.finished.length + Object.values(this.cpus).filter(Boolean).length + this.scheduler.ready.length + 1;
    const id = `P${taskCounter}`;
    
    // CONFIGURAÇÕES DA GERAÇÃO DE TAREFAS:
    const duration = 2 + Math.floor(Math.random() * 6); // [2…7] - Tempo de CPU necessário
    
    // Deadline = tempo atual + duração mínima + folga aleatória
    // Garante que deadline seja sempre >= duração (tecnicamente possível)
    const deadline = now + duration + (2 + Math.floor(Math.random() * 8)); // Folga de 2-9 unidades
    
    // Cria nova tarefa e adiciona ao escalonador
    const task = new Task({ id, arrival: now, duration, deadline });
    this.scheduler.add(task);           // Adiciona na fila do algoritmo
    this.bus.emit('taskArrival', task); // Notifica chegada para interface
  }

  /**
   * INICIA A SIMULAÇÃO
   * 
   * Configura e inicia o relógio da simulação.
   * O relógio começará a emitir eventos 'tick' em intervalos regulares.
   */
  start() { 
    this.clock.start(this.bus); 
  }
  
  /**
   * PARA A SIMULAÇÃO
   * 
   * Interrompe o relógio, pausando todos os processos.
   * Estado atual é preservado para possível retomada.
   */
  stop() { 
    this.clock.stop(); 
  }
}
