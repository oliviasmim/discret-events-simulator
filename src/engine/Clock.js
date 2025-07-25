/**
 * CLOCK - CONTROLE DE TEMPO DA SIMULAÇÃO
 * 
 * Gerencia o tempo lógico da simulação através de ticks discretos.
 * Cada tick representa uma unidade de tempo no sistema simulado.
 * 
 * Diferença entre tempo real e lógico:
 * - Tempo real: milissegundos do mundo real
 * - Tempo lógico: unidades discretas da simulação (0, 1, 2, 3...)
 */
export class Clock {
  #loop;
  
  /**
   * @param {number} stepMs - Intervalo em ms entre ticks (controla velocidade da simulação)
   */
  constructor(stepMs = 300) { 
    this.stepMs = stepMs;
    this.now = 0;
  }
  
  /**
   * Inicia o loop de simulação, emitindo eventos 'tick' periodicamente
   * @param {EventBus} bus - Sistema de eventos para notificar componentes
   */
  start(bus) {
    this.#loop = () => {
      bus.emit('tick', this.now);
      this.now += 1;
      this.timer = setTimeout(this.#loop, this.stepMs);
    }; 
    this.#loop();
  }
  
  /**
   * Para o loop de simulação
   */
  stop() { 
    clearTimeout(this.timer);
  }
  
  /**
   * Reinicia o tempo para zero
   */
  reset() {
    this.stop();
    this.now = 0;
  }
}
