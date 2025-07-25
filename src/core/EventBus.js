/**
 *  EVENTBUS - SISTEMA DE COMUNICAÇÃO ENTRE COMPONENTES
 * 
 * Utilizei o padrão  "Observer" ou "Pub/Sub" (Publish/Subscribe)
 * 
 * Como funciona:
 * 1. Componentes "escutam" (subscribe) eventos que os interessam
 * 2. Outros componentes "emitem" (publish) eventos quando algo acontece
 * 3. O EventBus entrega a mensagem para todos os interessados
 */
export class EventBus {
  #events = new Map();
  
  /**
   * @param {string} evt - Nome do evento (ex: 'process_started', 'tick')
   * @param {function} fn - Função para chamar quando evento acontecer
   * 
   * Exemplo: bus.on('process_started', (processo) => console.log('Processo iniciou!'))
   */
  on(evt, fn) { 
    // Se ainda não temos ninguém escutando este evento, cria uma lista vazia
    if (!this.#events.has(evt)) {
      this.#events.set(evt, []);
    }
    // Adiciona a função na lista de "interessados" neste evento
    this.#events.get(evt).push(fn);
  }
  
  /**
   * Unsubscribe
   * 
   * Remove uma função da lista de interessados em um evento.
   * 
   * @param {string} evt - Nome do evento
   * @param {function} fn - Função para remover
   */
  off(evt, fn) { 
    this.#events.set(evt, (this.#events.get(evt) || []).filter(f => f !== fn)); 
  }
  
  /**
   *  (Publish)
   * 
   * Dispara um evento, notificando todos os interessados.
   * 
   * @param {string} evt - Nome do evento a ser disparado
   * @param {any} payload - Dados para enviar junto com o evento
   * 
   * Exemplo: bus.emit('process_started', { id: 'P1', time: 5 })
   */
  emit(evt, payload) { 
    (this.#events.get(evt) || []).forEach(f => f(payload)); 
  }
}
