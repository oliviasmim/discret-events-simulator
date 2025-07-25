/**
 * ⚡ EDF (EARLIEST DEADLINE FIRST) SCHEDULER
 * 
 * O EDF é o "algoritmo inteligente" - sempre executa o processo com deadline mais próximo
 * 
 */

import { SchedulerBase } from '../core/SchedulerBase.js';

export default class EDF extends SchedulerBase {
  /**
   * 
   * 
   * ALGORITMO:
   * 1. Ordena todos os processos por deadline (menor primeiro)
   * 2. Em caso de empate, usa ordem de chegada (FCFS como desempate)
   * 3. Pega o primeiro da lista ordenada
   * 
   * @param {*} _ - Parâmetro não usado (mantido para compatibilidade)
   * @param {number} now - Tempo atual (poderia ser usado para detectar deadlines perdidos)
   * @returns {Task|null} - Processo com deadline mais próximo
   */
  _selectNext(_, now) {
    return this.ready.sort((a, b) => {
      if (a.deadline !== b.deadline) {
        return a.deadline - b.deadline;  // Ordem crescente de deadline
      }
      
      return a.arrival - b.arrival;
    }).shift() || null;  // Pega o primeiro (menor deadline) e remove da fila
  }
  
  /**
   * Execução EDF:
   * Tempo | Executando | Motivo
   * ------|------------|------------------------------------------
   * 0-1   | P1         | Único processo disponível
   * 1-2   | P2         | P2 tem deadline=4 < P1 deadline=6 → PREEMPÇÃO
   * 2-3   | P3         | P3 tem deadline=3 < P2 deadline=4 → PREEMPÇÃO
   * 3-5   | P2         | P3 terminou, P2 volta (deadline=4 < 6)
   * 5-7   | P1         | P2 terminou, P1 volta e termina
   * 
   */
}
