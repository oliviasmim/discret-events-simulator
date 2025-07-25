import { Simulation } from './engine/Simulation.js';
import { mountChart } from './ui/chart.js';
import { mountQueue } from './ui/queue.js';
import { mountStats } from './ui/stats.js';

// Instância global da simulação atual
let sim = null;

function init() {
  const algoSel = document.getElementById('algo');          // Dropdown para escolher algoritmo
  const quantumInp = document.getElementById('quantum');    // Campo para configurar quantum
  const startBtn = document.getElementById('startBtn');    // Botão "Iniciar"
  const stopBtn = document.getElementById('stopBtn');      // Botão "Parar"
  const loadingIndicator = document.getElementById('loadingIndicator'); // Spinner de loading

  // 📊 ELEMENTOS DE VISUALIZAÇÃO
  const chartEl = document.getElementById('chart');        // Gráfico de Gantt
  const queueEl = document.getElementById('queue');        // Fila de processos
  const statsEl = document.getElementById('stats');        // Estatísticas

  /**
   * 📱 FUNÇÕES DE CONTROLE DA INTERFACE
   */
  
  // Mostra o indicador de carregamento (aquele círculo girando)
  function showLoading() {
    startBtn.classList.add('hidden');              // Esconde botão "Iniciar"
    loadingIndicator.classList.remove('hidden');   // Mostra spinner
    startBtn.disabled = true;                      // Desabilita o botão
  }

  // Esconde o loading e mostra que está rodando
  function hideLoading() {
    loadingIndicator.classList.add('hidden');      // Esconde spinner
    stopBtn.classList.remove('hidden');           // Mostra botão "Parar"
    startBtn.disabled = false;                     // Reabilita botão
  }

  // Volta a interface para o estado inicial
  function resetUI() {
    startBtn.classList.remove('hidden');          // Mostra botão "Iniciar"
    stopBtn.classList.add('hidden');             // Esconde botão "Parar"
    loadingIndicator.classList.add('hidden');     // Esconde spinner
    startBtn.disabled = false;                    // Garante que botão está habilitado
  }

  /**
   * 🚀 EVENTO DO BOTÃO "INICIAR SIMULAÇÃO"
   */
  startBtn.onclick = () => {
    try {
      showLoading(); // Primeiro mostra o loading
      
      setTimeout(() => {
        try {
          chartEl.innerHTML = '';   // Limpa gráfico antigo
          queueEl.innerHTML = '';   // Limpa fila antiga
          statsEl.innerHTML = '';   // Limpa estatísticas antigas

          // 🏗️ CRIAÇÃO DA SIMULAÇÃO
          sim = new Simulation({ 
            algo: algoSel.value,        // Qual algoritmo usar (fcfs, rr, edf)
            quantum: +quantumInp.value  // Quantum para Round Robin (o + converte para número)
          });
          
          // 📈 CONECTANDO A VISUALIZAÇÃO
          // Cada componente visual "escuta" eventos da simulação através do EventBus
          mountChart(chartEl, sim.bus);   // Gráfico de Gantt escuta mudanças
          mountQueue(queueEl, sim.bus);   // Fila escuta quando processos entram/saem
          mountStats(statsEl, sim.bus);   // Estatísticas escutam para calcular métricas
          
          // COMEÇAR A SIMULAÇÃO!
          sim.start();       
          hideLoading();
          
          showNotification('✅ Simulação iniciada com sucesso!', 'success');
          
        } catch (error) {
          console.error('Erro ao iniciar simulação:', error);
          resetUI();     // Volta interface para estado inicial
          showNotification('❌ Erro ao iniciar a simulação. Tente novamente.', 'error');
        }
      }, 300); // Delay de 300ms para mostrar loading
      
    } catch (error) {
      // Erro na configuração inicial (antes mesmo de tentar simular)
      console.error('Erro ao configurar simulação:', error);
      resetUI();
      showNotification('❌ Erro na configuração. Verifique os parâmetros.', 'error');
    }
  };
  
  /**
   * 🛑 EVENTO DO BOTÃO "PARAR SIMULAÇÃO"
=   */
  stopBtn.onclick = () => {
    try {
      if (sim) {           // Se existe uma simulação rodando
        sim.stop();        // Para ela
      }
      resetUI();          // Volta interface ao normal
      showNotification('⏹️ Simulação interrompida', 'info');
    } catch (error) {
      console.error('Erro ao parar simulação:', error);
      showNotification('❌ Erro ao parar a simulação', 'error');
    }
  };

  /**
   * 📚 EVENTO DE MUDANÇA DE ALGORITMO
=   */
  algoSel.onchange = () => {
    // Dicionário com explicações de cada algoritmo
    const descriptions = {
      fcfs: 'Primeiro processo a chegar é o primeiro a ser executado. Não há preempção.',
      rr: 'Cada processo recebe uma fatia de tempo igual. Há preempção quando o quantum expira.',
      edf: 'Prioridade para processos com menor deadline. Usado em sistemas de tempo real.'
    };
    
    // Mostra explicação do algoritmo escolhido
    showNotification(`📚 ${descriptions[algoSel.value]}`, 'info');
    
    // 🎛️ CONTROLE DA INTERFACE: Mostra/esconde campo quantum
    const quantumContainer = quantumInp.parentElement;
    if (algoSel.value === 'rr') {
      quantumContainer.style.opacity = '1';    // Destaca o campo
      quantumInp.disabled = false;             // Habilita para edição
    } else {
      quantumContainer.style.opacity = '0.5';  // Deixa meio transparente
      quantumInp.disabled = true;              // Desabilita edição
    }
  };

  // 🎯 INICIALIZAÇÃO: Chama a função de mudança de algoritmo para configurar estado inicial
  algoSel.onchange();
}

/**
 * 🔔 SISTEMA DE NOTIFICAÇÕES
 * 
 * Esta função cria aquelas mensagens que aparecem no canto da tela para informar o usuário.
 * 
 * @param {string} message - A mensagem para mostrar
 * @param {string} type - Tipo da notificação ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
  const existing = document.querySelectorAll('.notification');
  existing.forEach(n => n.remove());
  
  const notification = document.createElement('div');
  notification.className = `notification fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 slide-in`;
  
  // 🎨 Cores diferentes para cada tipo de mensagem
  const colors = {
    success: 'bg-emerald-500 text-white',  // Verde para sucesso
    error: 'bg-red-500 text-white',        // Vermelho para erro
    info: 'bg-blue-500 text-white'         // Azul para informação
  };
  
  // Aplica a cor baseada no tipo
  notification.className += ` ${colors[type] || colors.info}`;
  notification.textContent = message;
  
  // 📱 Adiciona a notificação na página
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    // Depois de 300ms remove completamente do DOM
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * 🚀 INICIALIZAÇÃO DA APLICAÇÃO
 */
document.addEventListener('DOMContentLoaded', init);
