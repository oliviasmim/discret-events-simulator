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
   * 
   * @param {number} q - Quantum (time slice) em unidades de tempo
   *                    Quanto tempo cada processo pode executar antes de ser interrompido
   */
  constructor(q = 3) { 
    super();      
    this.q = q; 
  }
  
  /**
   * @returns {Task|null} - Próximo processo a executar
   */
  _selectNext() { 
    // Pega o primeiro da fila (igual FCFS)
    // A diferença é que em RR, processo pode voltar para a fila depois
    return this.ready.shift() || null; 
  }
  
  /**
   * RETORNA O QUANTUM (TIME SLICE)
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
   * ADICIONAR PROCESSO À FILA
   * 
   * IMPORTANTE: Esta função é sobrescrita para implementar a "circularidade" do Round Robin
   * 
   * @param {Task} task - Processo para adicionar na fila
   */
  add(task) { 
    // push() adiciona no FINAL da fila (diferente de FCFS que usa shift/unshift)
    // Isso garante que processos preemptados vão para o final da fila
    this.ready.push(task); 
  }
}
