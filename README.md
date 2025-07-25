# 🖥️ Simulador de Eventos Discretos

Um simulador interativo que demonstra como diferentes algoritmos de escalonamento de CPU funcionam em tempo real. Este projeto foi desenvolvido como uma ferramenta educacional para estudantes de Sistemas Operacionais.

## 📚 O que é Escalonamento de CPU?

O escalonamento de CPU é o processo pelo qual o sistema operacional decide qual processo deve receber tempo de processamento e quando. É como um gerente que organiza quem vai usar a máquina e por quanto tempo.

### Por que é importante?
- **Eficiência**: Maximiza o uso da CPU
- **Responsividade**: Garante que o sistema responda rapidamente
- **Fairness**: Todos os processos recebem uma chance justa

## 🎯 Algoritmos Implementados

### **1. FCFS (First-Come First-Served)**

**Como funciona:**
```javascript
// Pseudo-código simplificado
_selectNext() {
    return this.ready.shift(); // Pega o primeiro da fila
}
```

**Características:**
- ✅ **Simples** de implementar
- ❌ **Convoy Effect**: Processo longo bloqueia todos os outros
- 🎯 **Uso ideal**: Sistemas batch, operações sequenciais

**Exemplo Visual:**
```
Tempo: 0  1  2  3  4  5  6  7  8
P1:    [██████████████████████] (longo)
P2:                         [██] (rápido, mas espera)
P3:                           [██]
```

### **2. Round Robin**

**Conceito Fundamental: Quantum (Time Slice)**
- **Quantum pequeno** (1-2ms): Responsivo, mas muito overhead
- **Quantum grande** (100ms+): Vira FCFS, perde responsividade
- **Quantum ideal**: 10-50ms (depende do sistema)

**Implementação Interessante:**
```javascript
// Diferença crucial do FCFS
add(task) { 
    this.ready.push(task); // Vai para o FINAL da fila
}

timeSlice() { 
    return this.quantum; // Diz quando preemptar
}
```

**Preempção Explicada:**
- **O que é**: Interromper um processo em execução
- **Quando**: Quantum expira
- **Como**: Processo volta para final da fila

### **3. EDF (Earliest Deadline First)**

**Inteligência do Algoritmo:**
```javascript
_selectNext() {
    return this.ready.sort((a, b) => {
        // Prioridade: deadline mais próximo
        if (a.deadline !== b.deadline) {
            return a.deadline - b.deadline;
        }
        // Desempate: ordem de chegada
        return a.arrival - b.arrival;
    }).shift();
}
```
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

### **Padrão Arquitetural: Event-Driven (Orientado a Eventos)**

```
┌─────────────────────────────────────────────────────────────┐
│                        EventBus                            │
│          (Sistema de Comunicação Central)                  │
└─────────────┬─────────────┬─────────────┬─────────────────┘
              │             │             │
    ┌─────────▼──────┐ ┌────▼────┐ ┌──────▼─────────┐
    │   Simulation   │ │  Clock  │ │  UI Components │
    │   (Orquestra)  │ │ (Tempo) │ │   (Visualiza)  │
    └─────────┬──────┘ └─────────┘ └────────────────┘
              │
    ┌─────────▼──────────────────────────────────────┐
    │              Schedulers                        │
    │  ┌─────────┐ ┌─────────────┐ ┌─────────────┐  │
    │  │  FCFS   │ │ Round Robin │ │     EDF     │  │
    │  └─────────┘ └─────────────┘ └─────────────┘  │
    └────────────────────────────────────────────────┘
```
### **Principais Componentes**

#### **1. EventBus (Comunicação)**
- **Problema que resolve**: Como fazer componentes conversarem sem acoplamento?
- **Solução**: Padrão Observer/Pub-Sub
- **Exemplo prático**: Quando um processo termina, múltiplos componentes precisam saber (gráfico, estatísticas, fila)

#### **2. Clock (Tempo Discreto)**
- **Conceito**: Tempo lógico vs. tempo real
- **Implementação**: Ticks a cada 300ms (configurável)
- **Por que discreto?**: Simula como SOs realmente funcionam - decisões tomadas em intervalos regulares

#### **3. Simulation (Motor Principal)**
- **Responsabilidades**:
  - Gerenciar chegada de novos processos
  - Verificar processos em execução
  - Fazer preempção quando necessário
  - Manter estatísticas

#### **4. SchedulerBase (Hierarquia de Classes)**
- **Padrão**: Template Method
- **Vantagem**: Código comum compartilhado, comportamentos específicos customizáveis

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


## 📖 Referências

- **Documentação**: MDN Web Docs para JavaScript

## 📝 Licença

Este projeto é de uso educacional. Sinta-se livre para usar, modificar e compartilhar para fins de aprendizado.


