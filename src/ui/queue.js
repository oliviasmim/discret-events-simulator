export function mountQueue(root, bus) {
  root.innerHTML = '<ul id="qlist" class="space-y-2"></ul>';
  const list = root.querySelector('#qlist');
  
  function render(queue) {
    if (queue.length === 0) {
      list.innerHTML = '<li class="text-slate-400 text-center py-4 italic">Nenhum processo na fila</li>';
      return;
    }
    
    list.innerHTML = queue.map((task, index) => {
      const priority = queue.length - index;
      const priorityClass = priority <= 2 ? 'priority-high' : 
                           priority <= 4 ? 'priority-medium' : 
                           'priority-low';
      
      return `
        <li class="queue-item ${priorityClass}">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-white">${task.id}</span>
              <span class="text-xs text-slate-300">Pos. ${index + 1}</span>
            </div>
            <div class="text-right text-xs text-slate-300">
              <div>⏱️ Duração: ${task.duration}s</div>
              <div>⏰ Deadline: ${task.deadline === Infinity ? '∞' : task.deadline}s</div>
            </div>
          </div>
        </li>
      `;
    }).join('');
  }
  
  bus.on('state', ({ ready }) => render(ready));
  bus.on('taskArrival', () => {
    list.classList.add('pulse-soft');
    setTimeout(() => list.classList.remove('pulse-soft'), 1000);
  });
}
