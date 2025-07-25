/**
 * ⚡ EDF (EARLIEST DEADLINE FIRST) SCHEDULER
 * 
 * O EDF é o "algoritmo inteligente" - sempre executa o processo com deadline mais próximo
 * 
 * CARACTERÍSTICAS:
 * ✅ Ótimo para sistemas de tempo real
 * ✅ Teoricamente ótimo - se existe escalonamento que funciona, EDF encontra
 * ✅ Dinâmico - prioridades mudam conforme deadlines se aproximam
 * ✅ Pode preemptar quando chega processo com deadline menor
 * ❌ Complexo de implementar corretamente
 * ❌ Pode causar starvation em processos com deadline longo
 * ❌ Overhead computacional para ordenar processos
 * 
 * QUANDO USAR:
 * - Sistemas de tempo real críticos (controle de aeronaves, marca-passos)
 * - Sistemas embarcados com restrições temporais
 * - Aplicações multimídia (streaming de vídeo/áudio)
 * - Qualquer sistema onde "perder deadline" é inaceitável
 * 
 * TIPOS DE DEADLINE:
 * - Hard deadline: Perder = catástrofe (ex: freios ABS)
 * - Soft deadline: Perder = degradação (ex: frame de vídeo)
 * - Firm deadline: Perder = inútil (ex: pacote de rede)
 */

import { SchedulerBase } from '../core/SchedulerBase.js';

export default class EDF extends SchedulerBase {
  /**
   * 🎯 SELEÇÃO DO PRÓXIMO PROCESSO
   * 
   * Esta é a função mais complexa dos três algoritmos!
   * EDF precisa sempre escolher o processo com deadline mais próximo.
   * 
   * ALGORITMO:
   * 1. 📊 Ordena todos os processos por deadline (menor primeiro)
   * 2. 🤝 Em caso de empate, usa ordem de chegada (FCFS como desempate)
   * 3. 🎯 Pega o primeiro da lista ordenada
   * 
   * @param {*} _ - Parâmetro não usado (mantido para compatibilidade)
   * @param {number} now - Tempo atual (poderia ser usado para detectar deadlines perdidos)
   * @returns {Task|null} - Processo com deadline mais próximo
   */
  _selectNext(_, now) {
    // 📊 ALGORITMO EDF: Ordena por deadline, depois por chegada
    return this.ready.sort((a, b) => {
      // 🕐 Primeiro critério: Deadline mais próximo tem prioridade
      if (a.deadline !== b.deadline) {
        return a.deadline - b.deadline;  // Ordem crescente de deadline
      }
      
      // 🤝 Segundo critério: Em caso de empate, usa FCFS (ordem de chegada)
      // Isso evita comportamento não-determinístico
      return a.arrival - b.arrival;
    }).shift() || null;  // Pega o primeiro (menor deadline) e remove da fila
  }
  
  /**
   * 📚 INFORMAÇÕES EDUCACIONAIS
   * 
   * COMO FUNCIONA O EDF:
   * 
   * 1. 📥 Processo chega com seu deadline
   * 2. 🔍 Sistema verifica se há alguém executando
   * 3. ⚖️ Se processo atual tem deadline > novo processo → PREEMPÇÃO!
   * 4. 🎯 Sempre executa quem tem deadline mais próximo
   * 5. 🔄 Repete a cada chegada de processo
   * 
   * EXEMPLO PRÁTICO:
   * P1: arrival=0, duration=3, deadline=6
   * P2: arrival=1, duration=2, deadline=4  ← deadline mais apertado!
   * P3: arrival=2, duration=1, deadline=3  ← deadline ainda mais apertado!
   * 
   * Execução EDF:
   * Tempo | Executando | Motivo
   * ------|------------|------------------------------------------
   * 0-1   | P1         | Único processo disponível
   * 1-2   | P2         | P2 tem deadline=4 < P1 deadline=6 → PREEMPÇÃO
   * 2-3   | P3         | P3 tem deadline=3 < P2 deadline=4 → PREEMPÇÃO
   * 3-5   | P2         | P3 terminou, P2 volta (deadline=4 < 6)
   * 5-7   | P1         | P2 terminou, P1 volta e termina
   * 
   * Todos terminaram antes de seus deadlines! ✅
   * 
   * TEORIA DOS SISTEMAS DE TEMPO REAL:
   * 
   * UTILIZAÇÃO = Σ(Duration/Deadline) para todos os processos
   * - Se Utilização ≤ 1.0 → EDF consegue escalonar todos
   * - Se Utilização > 1.0 → Impossível escalonar (alguns vão perder deadline)
   * 
   * VANTAGENS DO EDF:
   * 1. ÓTIMO: Se algum algoritmo consegue, EDF consegue
   * 2. DINÂMICO: Prioridades se adaptam automaticamente
   * 3. UTILIZACÃO MÁXIMA: Pode usar 100% da CPU de forma ótima
   * 
   * PROBLEMAS DO EDF:
   * 1. COMPLEXIDADE: O(n log n) para ordenar processos
   * 2. STARVATION: Processos com deadline longo podem nunca executar
   * 3. DOMINO EFFECT: Um processo perdendo deadline pode causar cascata
   * 4. IMPREVISIBILIDADE: Difícil calcular tempo de resposta worst-case
   * 
   * COMPARAÇÃO COM OUTROS ALGORITMOS:
   * - vs FCFS: EDF é dinâmico, FCFS é estático
   * - vs Round Robin: EDF prioriza urgência, RR prioriza fairness
   * - vs Priority: EDF muda prioridades automaticamente baseado no tempo
   * 
   * USO NO MUNDO REAL:
   * - Linux: Scheduler SCHED_DEADLINE usa EDF
   * - Windows: Não usa EDF puro, mas tem elementos similares
   * - VxWorks: Sistema operacional de tempo real usa EDF
   * - Controle automotivo: ECUs usam variações de EDF
   */
}
