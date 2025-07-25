/**
 * FCFS (FIRST-COME FIRST-SERVED) SCHEDULER
 * 
 * Algoritmo de escalonamento não-preemptivo que executa processos na ordem de chegada.
 * 
 * Características:
 * - Simples de implementar
 * - Não há preempção
 * - Pode causar convoy effect (processos longos atrasam os curtos)
 * - Adequado para sistemas batch
 * 
 * Complexidade: O(1) para seleção do próximo processo
 */

import { SchedulerBase } from '../core/SchedulerBase.js';

export default class FCFS extends SchedulerBase {
  /**
   * Seleciona o próximo processo a executar
   * Para FCFS, sempre seleciona o primeiro da fila (ordem de chegada)
   * 
   * @returns {Task|null} Próximo processo ou null se fila vazia
   */
  _selectNext() {
    if (!this.ready.length) return null;
    return this.ready.shift(); // Remove e retorna o primeiro da fila
  }
}
