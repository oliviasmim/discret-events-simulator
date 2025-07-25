# 🖥️ Simulador de Eventos Discretos

Um simulador interativo que demonstra como diferentes algoritmos de escalonamento de CPU funcionam em tempo real. Este projeto foi desenvolvido como uma ferramenta educacional para estudantes de Sistemas Operacionais.

## 📚 O que é Escalonamento de CPU?

O escalonamento de CPU é o processo pelo qual o sistema operacional decide qual processo deve receber tempo de processamento e quando. É como um gerente que organiza quem vai usar a máquina e por quanto tempo.

### Por que é importante?
- **Eficiência**: Maximiza o uso da CPU
- **Responsividade**: Garante que o sistema responda rapidamente
- **Fairness**: Todos os processos recebem uma chance justa

## 🎯 Algoritmos Implementados

### 1. FCFS (First-Come First-Served)
**Como funciona**: O primeiro processo que chega é o primeiro a ser executado.
- ✅ **Simples** de implementar
- ❌ **Convoy Effect**: Processos longos atrasam os curtos
- 📖 **Exemplo**: Como uma fila de banco - quem chega primeiro é atendido primeiro

### 2. Round Robin
**Como funciona**: Cada processo recebe um tempo fixo (quantum) para executar.
- ✅ **Justo** para todos os processos
- ✅ **Responsivo** para sistemas interativos
- ⚠️ **Context Switch**: Trocar muito entre processos tem custo
- 📖 **Exemplo**: Como revezar um videogame - cada um joga por 5 minutos

### 3. EDF (Earliest Deadline First)
**Como funciona**: O processo com deadline mais próximo executa primeiro.
- ✅ **Otimizado** para sistemas de tempo real
- ✅ **Dinâmico**: Prioridades mudam conforme deadlines
- ❌ **Complexo** de implementar
- 📖 **Exemplo**: Como fazer tarefas escolares - a que vence primeiro tem prioridade

## 🚀 Como Usar

### Pré-requisitos
- Navegador web moderno (Chrome, Firefox, Safari)
- Servidor web local (pode usar Python, Node.js, ou extensão do VS Code)

### Executando o Projeto
```bash

# Opção 1: Node.js
npm install
npm start
# Opção 2: VS Code
# Instale a extensão "Live Server" e clique com botão direito no index.html
```

Depois acesse: `http://localhost:3000`

### Interface do Simulador
1. **Escolha o algoritmo** no dropdown
2. **Configure o quantum** (só para Round Robin)
3. **Clique em "Iniciar Simulação"**
4. **Observe**:
   - **Gráfico de Gantt**: Mostra a execução visual dos processos
   - **Fila de Processos**: Lista os processos esperando
   - **Estatísticas**: Métricas de performance

## 🛠️ Estrutura do Projeto

```
real-time-discrete-event-scheduler/
├── index.html              # Interface principal
├── styles.css               # Estilos visuais
├── README.md               # Documentação (este arquivo)
└── src/
    ├── main.js             # Ponto de entrada da aplicação
    ├── core/
    │   ├── EventBus.js     # Sistema de eventos
    │   └── Task.js         # Modelo de processo/tarefa
    ├── engine/
    │   ├── Clock.js        # Relógio da simulação
    │   └── Simulation.js   # Motor principal da simulação
    ├── schedulers/
    │   ├── SchedulerBase.js # Classe base para algoritmos
    │   ├── FCFS.js         # Algoritmo First-Come First-Served
    │   ├── RoundRobin.js   # Algoritmo Round Robin
    │   └── EDF.js          # Algoritmo Earliest Deadline First
    └── ui/
        ├── Chart.js        # Gráfico de Gantt
        ├── Queue.js        # Visualização da fila
        └── Stats.js        # Estatísticas de performance
```

## 🎨 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica da página
- **CSS3**: Estilos com glassmorphism e animações
- **JavaScript ES6+**: Programação orientada a objetos e módulos
- **Tailwind CSS**: Framework CSS utilitário

## 📊 Métricas Calculadas

### Tempos Importantes
- **Arrival Time**: Quando o processo chega no sistema
- **Burst Time**: Quanto tempo o processo precisa de CPU
- **Start Time**: Quando o processo começa a executar
- **Finish Time**: Quando o processo termina
- **Turnaround Time**: Tempo total no sistema (Finish - Arrival)
- **Waiting Time**: Tempo esperando na fila (Turnaround - Burst)
- **Response Time**: Tempo até primeira execução (Start - Arrival)

### Médias do Sistema
- **Turnaround Médio**: Eficiência geral do sistema
- **Tempo de Espera Médio**: Quanto os processos ficam parados
- **Tempo de Resposta Médio**: Responsividade do sistema

## 🎓 Conceitos Aprendidos

### Escalonamento Preemptivo vs Não-Preemptivo
- **Não-Preemptivo (FCFS)**: Processo roda até terminar
- **Preemptivo (RR, EDF)**: Sistema pode interromper processos

### Context Switch
O custo de trocar entre processos:
- Salvar estado do processo atual
- Carregar estado do próximo processo
- Atualizar registradores e memória

### Starvation
Quando um processo nunca consegue executar:
- FCFS: Não tem starvation
- Round Robin: Não tem starvation
- EDF: Processos com deadline longo podem sofrer starvation

## 🐛 Como Debuggar

### Problemas Comuns
1. **Simulação não inicia**: Verifique o servidor web
2. **Gráfico não aparece**: Abra o console do navegador (F12)
3. **Processos não executam**: Verifique se há erros no console

### Logs Úteis
O simulador imprime logs no console do navegador:
```javascript
// Exemplos de logs que você verá
console.log('Processo P1 iniciou execução')
console.log('Processo P2 foi preemptado')
console.log('Sistema tem 3 processos na fila')
```

## 🤝 Contribuindo

Este é um projeto educacional! Sugestões de melhorias:
- Novos algoritmos (SJF, Priority Scheduling)
- Mais métricas (CPU Utilization, Throughput)
- Visualizações diferentes
- Testes automatizados

## 📖 Referências

- **Livro**: "Sistemas Operacionais Modernos" - Andrew Tanenbaum
- **Curso**: Conceitos de Sistemas Operacionais
- **Documentação**: MDN Web Docs para JavaScript

## 📝 Licença

Este projeto é de uso educacional. Sinta-se livre para usar, modificar e compartilhar para fins de aprendizado.


