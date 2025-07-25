/**
 * ⏰ ROUND ROBIN SCHEDULER
 * 
 * O Round Robin é um algoritmo "democrático" - todos os processos recebem uma chance igual
 * 
 * CARACTERÍSTICAS:
 * ✅ Justo - todos os processos recebem tempo igual de CPU
 * ✅ Responsivo - bom para sistemas interativos
 * ✅ Não há starvation - todo processo eventualmente executa
 * ✅ Preemptivo - pode interromper processos
 * ⚠️ Context switch overhead - trocar entre processos tem custo
 * ⚠️ Quantum crítico - valor muito pequeno ou grande prejudica performance
 * 
 * QUANDO USAR:
 * - Sistemas de tempo compartilhado (time-sharing)
 * - Ambientes multiusuário
 * - Sistemas interativos (ex: interface gráfica)
 * - Quando responsividade é mais importante que throughput
 * 
 * QUANTUM (TIME SLICE):
 * - Muito pequeno (1-2ms): Muitas trocas de contexto, overhead alto
 * - Muito grande (100ms+): Vira praticamente FCFS, perde responsividade
 * - Ideal: Entre 10-100ms dependendo do sistema
 */

import { SchedulerBase } from '../core/SchedulerBase.js';

export default class RoundRobin extends SchedulerBase {
  /**
   * 🏗️ CONSTRUTOR
   * 
   * @param {number} q - Quantum (time slice) em unidades de tempo
   *                    Quanto tempo cada processo pode executar antes de ser interrompido
   */
  constructor(q = 3) { 
    super();      // Chama construtor da classe pai
    this.q = q;   // Salva o quantum configurado
  }
  
  /**
   * 🎯 SELEÇÃO DO PRÓXIMO PROCESSO
   * 
   * Round Robin é simples na seleção: sempre pega o primeiro da fila!
   * A "magia" está na preempção - quando o quantum acaba, processo volta pro final da fila.
   * 
   * @returns {Task|null} - Próximo processo a executar
   */
  _selectNext() { 
    // Pega o primeiro da fila (igual FCFS)
    // A diferença é que em RR, processo pode voltar para a fila depois
    return this.ready.shift() || null; 
  }
  
  /**
   * ⏰ RETORNA O QUANTUM (TIME SLICE)
   * 
   * Esta função diz quanto tempo um processo pode executar antes de ser interrompido.
   * É chamada pela simulação para saber quando fazer preempção.
   * 
   * @returns {number} - Quantum em unidades de tempo
   */
  timeSlice() { 
    return this.q; 
  }
  
  /**
   * ➕ ADICIONAR PROCESSO À FILA
   * 
   * IMPORTANTE: Esta função é sobrescrita para implementar a "circularidade" do Round Robin.
   * 
   * Diferença do FCFS:
   * - FCFS: Processo entra na fila só quando chega ao sistema
   * - Round Robin: Processo pode voltar para o FINAL da fila quando é preemptado
   * 
   * É como uma fila circular: quando seu tempo acaba, você vai para o final e espera sua próxima vez!
   * 
   * @param {Task} task - Processo para adicionar na fila
   */
  add(task) { 
    // push() adiciona no FINAL da fila (diferente de FCFS que usa shift/unshift)
    // Isso garante que processos preemptados vão para o final da fila
    this.ready.push(task); 
  }
  
  /**
   * 
   * COMO FUNCIONA O ROUND ROBIN:
   * 
   * 1. 📥 Processo chega → vai para fila
   * 2. 🎯 Scheduler escolhe primeiro da fila
   * 3. ▶️ Processo executa por até Q unidades de tempo
   * 4. 🔄 Se não terminou e quantum acabou → volta para FINAL da fila
   * 5. ✅ Se terminou → sai do sistema
   * 6. 🔁 Repete para próximo processo
   * 
   * EXEMPLO PRÁTICO:
   * Processos: P1(10), P2(4), P3(2) com Quantum=3
   * 
   * Tempo | Executando | Fila
   * ------|------------|----------
   * 0-3   | P1         | [P2, P3]
   * 3-6   | P2         | [P3, P1]  ← P1 voltou com 7 restantes
   * 6-8   | P3         | [P1]      ← P3 terminou (só precisava 2)
   * 8-11  | P1         | [P2]      ← P2 voltou com 1 restante
   * 11-12 | P2         | []        ← P2 terminou
   * 12-19 | P1         | []        ← P1 terminou
   * 
   * VANTAGENS vs FCFS:
   * - Responsividade: P3 terminou no tempo 8 (vs 16 no FCFS)
   * - Fairness: Todos receberam chances iguais
   * - Interatividade: Sistema "responde" a cada 3 unidades
   * 
   * ESCOLHA DO QUANTUM:
   * - Quantum = 1: Overhead altíssimo, mas responsividade máxima
   * - Quantum = ∞: Vira FCFS, perde a responsividade
   * - Quantum ideal: 80% dos processos terminam em 1 quantum
   */
}
