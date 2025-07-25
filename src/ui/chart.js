/**
 * GRÁFICO DE GANTT - VISUALIZAÇÃO DA EXECUÇÃO DOS PROCESSOS
 * 
 * Implementa um gráfico de Gantt interativo que mostra visualmente
 * a execução dos processos ao longo do tempo.
 * 
 * Legenda de cores:
 * - Verde: Processo executando
 * - Laranja: Processo preemptado
 * - Azul: Processo concluído
 * - Cinza: CPU ociosa
 */

/**
 * Monta o componente de gráfico e conecta aos eventos da simulação
 * 
 * @param {HTMLElement} root - Elemento onde o gráfico será renderizado
 * @param {EventBus} bus - Sistema de eventos da simulação
 */
export function mountChart(root, bus) {
  root.classList.add('relative');
  
  // Container para a linha do tempo
  const timeline = document.createElement('div');
  timeline.className = 'relative';
  root.append(timeline);
  
  // Eixo temporal (números 0, 1, 2, 3...)
  const timeAxis = document.createElement('div');
  timeAxis.className = 'time-axis';
  timeAxis.id = 'timeAxis';
  timeline.append(timeAxis);
  
  // Container para as linhas dos processos
  const processRows = document.createElement('div');
  processRows.className = 'space-y-1';
  processRows.id = 'processRows';
  timeline.append(processRows);
  
  // Estruturas de controle
  const taskRows = new Map();        // Mapeamento processo -> linha
  const executionHistory = new Map(); // Histórico de execução por processo
  let currentTime = 0;
  let nextRowIndex = 0;

  /**
   * Atualiza a escala de tempo do gráfico
   */
  function updateTimeAxis(maxTime) {
    timeAxis.innerHTML = '';
    for (let t = 0; t <= maxTime; t += 1) {
      const tick = document.createElement('div');
      tick.className = 'time-tick';
      tick.textContent = t;
      timeAxis.append(tick);
    }
  }

  /**
   * Cria uma nova linha para representar um processo
   */
  function createProcessRow(taskId) {
    const row = document.createElement('div');
    row.className = 'process-row';
    row.id = `row-${taskId}`;
    
    // Rótulo do processo
    const label = document.createElement('div');
    label.className = 'process-label';
    label.textContent = taskId;
    
    // Linha de execução
    const executionLine = document.createElement('div');
    executionLine.className = 'flex gap-0.5 flex-1';
    executionLine.id = `line-${taskId}`;
    
    row.append(label, executionLine);
    processRows.append(row);
    return row;
  }

  function createExecutionBlock(task, startTime, duration, isPreempted = false, isCompleted = false) {
    const block = document.createElement('div');
    const width = duration * 16; // 16px per time unit
    
    block.className = 'execution-block';
    block.style.width = `${width}px`;
    
    if (isCompleted) {
      block.classList.add('completed');
      block.title = `Processo ${task.id} - Concluído (${duration} unidades)`;
    } else if (isPreempted) {
      block.classList.add('preempted');
      block.title = `Processo ${task.id} - Preemptado (${duration} unidades)`;
    } else {
      block.classList.add('running');
      block.title = `Processo ${task.id} - Executando (${duration} unidades)`;
    }
    
    block.textContent = task.id;
    return block;
  }

  function createWaitingGap(duration) {
    const gap = document.createElement('div');
    gap.className = 'waiting-gap';
    gap.style.width = `${duration * 16}px`;
    gap.title = 'Processo aguardando na fila';
    return gap;
  }

  bus.on('taskStart', ({ task, now }) => {
    currentTime = Math.max(currentTime, now + 1);
    updateTimeAxis(currentTime + 5); // Show a bit ahead
    
    // Create row if it doesn't exist
    if (!taskRows.has(task.id)) {
      taskRows.set(task.id, nextRowIndex++);
      createProcessRow(task.id);
      executionHistory.set(task.id, []);
    }
    
    // Record start of execution segment
    const history = executionHistory.get(task.id);
    history.push({ startTime: now, duration: 0, isPreempted: false });
  });

  bus.on('state', ({ now, cpus }) => {
    currentTime = Math.max(currentTime, now + 1);
    updateTimeAxis(currentTime + 5);
    
    // Update execution blocks for running tasks
    cpus.forEach(task => {
      if (!task) return;
      
      const history = executionHistory.get(task.id);
      if (history && history.length > 0) {
        const currentSegment = history[history.length - 1];
        currentSegment.duration = now - currentSegment.startTime + 1;
        
        // Update visual representation
        updateTaskVisualization(task.id);
      }
    });
  });

  bus.on('taskFinish', (task) => {
    // Mark final block as completed
    const history = executionHistory.get(task.id);
    if (history && history.length > 0) {
      const finalSegment = history[history.length - 1];
      finalSegment.isCompleted = true;
    }
    updateTaskVisualization(task.id);
  });

  // Handle preemption (when task is removed from CPU)
  bus.on('taskPreempted', ({ task, now }) => {
    const history = executionHistory.get(task.id);
    if (history && history.length > 0) {
      const currentSegment = history[history.length - 1];
      currentSegment.duration = now - currentSegment.startTime;
      currentSegment.isPreempted = true;
    }
    updateTaskVisualization(task.id);
  });

  function updateTaskVisualization(taskId) {
    const executionLine = document.getElementById(`line-${taskId}`);
    if (!executionLine) return;
    
    // Clear existing blocks
    executionLine.innerHTML = '';
    
    const history = executionHistory.get(taskId) || [];
    let currentPosition = 0;
    
    history.forEach(segment => {
      // Add gap if there's a time gap
      if (segment.startTime > currentPosition) {
        const gapDuration = segment.startTime - currentPosition;
        const gap = createWaitingGap(gapDuration);
        executionLine.append(gap);
      }
      
      // Add execution block
      if (segment.duration > 0) {
        const block = createExecutionBlock(
          { id: taskId }, 
          0, // Position handled by flexbox now
          segment.duration, 
          segment.isPreempted && !segment.isCompleted,
          segment.isCompleted
        );
        
        executionLine.append(block);
      }
      
      currentPosition = segment.startTime + segment.duration;
    });
  }
}
