/**
 * SIMULADOR DE ESCALONAMENTO DE CPU - PONTO DE ENTRADA
 * 
 * Arquivo principal da aplicação responsável por:
 * 1. Coordenar a inicialização de todos os componentes
 * 2. Gerenciar eventos da interface do usuário
 * 3. Conectar a simulação com os componentes visuais
 * 4. Controlar o estado da aplicação (rodando/parado)
 */

import { Simulation } from './engine/Simulation.js';
import { mountChart } from './ui/chart.js';
import { mountQueue } from './ui/queue.js';
import { mountStats } from './ui/stats.js';

// Instância global da simulação atual
let sim = null;

/**
 * Inicializa a aplicação configurando todos os elementos da interface
 */
function init() {
  // Referências para elementos da interface
  // É como "encontrar" os botões e campos na tela para poder usá-los
  const algoSel = document.getElementById('algo');          // Dropdown para escolher algoritmo
  const quantumInp = document.getElementById('quantum');    // Campo para configurar quantum
  const startBtn = document.getElementById('startBtn');    // Botão "Iniciar"
  const stopBtn = document.getElementById('stopBtn');      // Botão "Parar"
  const loadingIndicator = document.getElementById('loadingIndicator'); // Spinner de loading

  // 📊 ELEMENTOS DE VISUALIZAÇÃO
  // Aqui é onde vamos "desenhar" os resultados da simulação
  const chartEl = document.getElementById('chart');        // Gráfico de Gantt
  const queueEl = document.getElementById('queue');        // Fila de processos
  const statsEl = document.getElementById('stats');        // Estatísticas

  /**
   * 📱 FUNÇÕES DE CONTROLE DA INTERFACE
   * Estas funções controlam o que o usuário vê na tela
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
   * Esta é a função mais importante! É ela que faz tudo começar a funcionar.
   */
  startBtn.onclick = () => {
    try {
      showLoading(); // Primeiro mostra o loading
      
      // Pequeno delay para dar tempo do usuário ver o loading
      // É como dar uma "respirada" antes de começar
      setTimeout(() => {
        try {
          // 🧹 LIMPEZA: Remove tudo da tela anterior
          chartEl.innerHTML = '';   // Limpa gráfico antigo
          queueEl.innerHTML = '';   // Limpa fila antiga
          statsEl.innerHTML = '';   // Limpa estatísticas antigas

          // 🏗️ CRIAÇÃO DA SIMULAÇÃO
          // Aqui criamos uma nova simulação com as configurações escolhidas pelo usuário
          sim = new Simulation({ 
            algo: algoSel.value,        // Qual algoritmo usar (fcfs, rr, edf)
            quantum: +quantumInp.value  // Quantum para Round Robin (o + converte para número)
          });
          
          // 📈 CONECTANDO A VISUALIZAÇÃO
          // Cada componente visual "escuta" eventos da simulação através do EventBus
          mountChart(chartEl, sim.bus);   // Gráfico de Gantt escuta mudanças
          mountQueue(queueEl, sim.bus);   // Fila escuta quando processos entram/saem
          mountStats(statsEl, sim.bus);   // Estatísticas escutam para calcular métricas
          
          // 🎬 COMEÇAR A SIMULAÇÃO!
          sim.start();       // Liga o "motor" da simulação
          hideLoading();     // Remove loading e mostra botão parar
          
          // Mostra mensagem de sucesso para o usuário
          showNotification('✅ Simulação iniciada com sucesso!', 'success');
          
        } catch (error) {
          // 🚨 SE DEU ALGO ERRADO
          // Log do erro para desenvolvedores debugarem
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
   * Para a simulação e volta ao estado inicial
   */
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
   * Quando usuário muda o algoritmo, mostra explicação e ajusta interface
   */
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
    // Quantum só é relevante para Round Robin
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
 * É como um "toast" que aparece e desaparece automaticamente.
 * 
 * @param {string} message - A mensagem para mostrar
 * @param {string} type - Tipo da notificação ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
  // 🧹 Remove notificações anteriores (para não acumular na tela)
  const existing = document.querySelectorAll('.notification');
  existing.forEach(n => n.remove());
  
  // 🏗️ Cria o elemento HTML da notificação
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
  
  // ⏰ Auto-remove após 3 segundos
  setTimeout(() => {
    // Primeiro faz fade out suave
    notification.style.opacity = '0';
    // Depois de 300ms remove completamente do DOM
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * 🚀 INICIALIZAÇÃO DA APLICAÇÃO
 * 
 * Este evento espera a página carregar completamente antes de executar nossa função init().
 * É como esperar todos os "atores" chegarem no teatro antes de começar a peça!
 */
document.addEventListener('DOMContentLoaded', init);
