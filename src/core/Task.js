/**
 * TASK (PROCESSO) - MODELO DE UM PROCESSO/TAREFA
 * 
 * Esta classe representa um processo no simulador de CPU, encapsulando todas as
 * informações necessárias para o escalonamento: tempos de chegada, execução,
 * deadline e métricas calculadas.
 * 
 * Estados do processo durante execução:
 * 1. Chegada ao sistema (arrival)
 * 2. Aguardando na fila (waiting)
 * 3. Executando na CPU (running)
 * 4. Preemptado/interrompido (preempted)
 * 5. Concluído (finished)
 */
export class Task {
  /**
   * Construtor - Inicializa um novo processo
   * 
   * @param {string} id - Identificador único do processo
   * @param {number} arrival - Tempo de chegada ao sistema
   * @param {number} duration - Tempo total de CPU necessário (burst time)
   * @param {number} deadline - Prazo limite para conclusão (usado no EDF)
   */
  constructor({ id, arrival, duration, deadline = Infinity }) {
    // Propriedades imutáveis
    Object.assign(this, { id, arrival, duration, deadline });
    
    // Propriedades que mudam durante a execução
    this.remaining = duration;    // Tempo restante de execução (para Round Robin)
    this.start = null;           // Tempo de início da primeira execução
    this.finish = null;          // Tempo de conclusão
    this.preempted = false;      // Flag para indicar se foi preemptado
  }
  
  /**
   * Turnaround Time - Tempo total no sistema
   * Fórmula: Tempo de conclusão - Tempo de chegada
   */
  get turnaroundTime() {
    return this.finish !== null ? this.finish - this.arrival : null;
  }
  
  /**
   * Waiting Time - Tempo de espera na fila
   * Fórmula: Turnaround Time - Burst Time
   */
  get waitingTime() {
    return this.turnaroundTime !== null ? this.turnaroundTime - this.duration : null;
  }
  
  /**
   * Response Time - Tempo até primeira execução
   * Fórmula: Tempo de início - Tempo de chegada
   */
  get responseTime() {
    return this.start !== null ? this.start - this.arrival : null;
  }
  
  /**
   * Indica se o processo foi concluído
   */
  get completed() {
    return this.finish !== null;
  }
  
  /**
   * Indica se o processo está atualmente executando
   */
  get executing() {
    return this.start !== null && this.finish === null && this.remaining < this.duration;
  }
  
  /**
   * Progresso de execução (0 a 1)
   */
  get progress() {
    return (this.duration - this.remaining) / this.duration;
  }
}
