/**
 * PAINEL DE ESTATÍSTICAS - MÉTRICAS DE PERFORMANCE
 * 
 * Calcula e exibe métricas importantes para avaliar algoritmos de escalonamento:
 * - Total de processos e processos concluídos
 * - Turnaround time médio
 * - Tempo de espera médio
 * - Tempo de resposta médio
 * - Deadlines perdidas (relevante para EDF)
 * - Taxa de conclusão (throughput)
 */

/**
 * Monta o painel de estatísticas e conecta aos eventos da simulação
 * 
 * @param {HTMLElement} root - Elemento onde painel será renderizado
 * @param {EventBus} bus - Sistema de eventos da simulação
 */
export function mountStats(root, bus) {
  /**
   * Cria um item de estatística na interface
   */
  const createStatItem = (id, icon, label) => `
    <div class="stat-item">
      <span class="stat-label">
        ${icon} <span>${label}</span>
      </span>
      <span id="${id}" class="stat-value">-</span>
    </div>
  `;
  
  // Estrutura HTML do painel
  root.innerHTML = `
    <div class="space-y-1">
      ${createStatItem('totalTasks', '📋', 'Total de Processos')}
      ${createStatItem('completedTasks', '✅', 'Processos Concluídos')}
      ${createStatItem('ta', '⏱️', 'Turnaround Médio')}
      ${createStatItem('wait', '⏳', 'Tempo de Espera Médio')}
      ${createStatItem('response', '⚡', 'Tempo de Resposta Médio')}
      ${createStatItem('miss', '❌', 'Deadlines Perdidas')}
      ${createStatItem('throughput', '📊', 'Taxa de Conclusão')}
    </div>
  `;
  
  // Variáveis de controle
  let finished = [];
  let totalTasks = 0;
  let startTime = Date.now();
  
  // Event listeners
  bus.on('taskArrival', () => {
    totalTasks++;
    update();
  });
  
  bus.on('taskFinish', task => { 
    finished.push(task);
    update();
  });
  
  /**
   * Recalcula e atualiza todas as métricas
   */
  function update() {
    const mean = arr => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    
    // Coleta de dados dos processos terminados
    const completedCount = finished.length;
    const turnaroundTimes = finished.map(t => t.finish - t.arrival);
    const waitTimes = finished.map(t => calculateWaitTime(t));
    const responseTimes = finished.map(t => t.start - t.arrival);
    
    // Cálculo das médias
    const avgTurnaround = mean(turnaroundTimes);
    const avgWait = mean(waitTimes);
    const avgResponse = mean(responseTimes);
    const missedDeadlines = finished.filter(t => t.finish > t.deadline).length;
    
    // Throughput
    const elapsedMinutes = (Date.now() - startTime) / 60000;
    const throughput = elapsedMinutes > 0 ? (completedCount / elapsedMinutes) : 0;
    
    updateElement('totalTasks', totalTasks.toString());
    updateElement('completedTasks', completedCount.toString());
    updateElement('ta', avgTurnaround.toFixed(1) + 's');
    updateElement('wait', avgWait.toFixed(1) + 's');
    updateElement('response', avgResponse.toFixed(1) + 's');
    updateElement('miss', missedDeadlines.toString());
    updateElement('throughput', throughput.toFixed(1) + '/min');
  }
  
  function calculateWaitTime(task) {
    // Wait time = Turnaround time - Execution time
    const turnaroundTime = task.finish - task.arrival;
    const executionTime = task.duration;
    return Math.max(0, turnaroundTime - executionTime);
  }
  
  function updateElement(id, value) {
    const element = root.querySelector(`#${id}`);
    if (element && element.textContent !== value) {
      element.textContent = value;
      element.classList.add('slide-in');
      setTimeout(() => element.classList.remove('slide-in'), 300);
    }
  }
}
