import { Clock } from './Clock.js';
import { EventBus } from '../core/EventBus.js';
import { Task } from '../core/Task.js';
import FCFS from '../schedulers/fcfs.js';
import RoundRobin from '../schedulers/rr.js';
import EDF from '../schedulers/edf.js';

const ALGO_MAP = { fcfs: FCFS, rr: RoundRobin, edf: EDF };

export class Simulation {
  constructor({ algo = 'fcfs', quantum = 3, cpuCount = 1 }) {
    this.bus = new EventBus();
    this.scheduler = new (ALGO_MAP[algo])(quantum);
    this.clock = new Clock();
    this.cpus = Array(cpuCount).fill(null);
    this.cpuStartTimes = Array(cpuCount).fill(null); // Track when current task started on each CPU
    this.finished = [];
    // listeners
    this.bus.on('tick', now => this.#onTick(now));
  }

  #onTick(now) {
    // 1. feed new arrivals (mock pattern: Poisson-ish every few ticks)
    this.#spawnRandomTask(now);
    
    // 2. check running tasks
    this.cpus.forEach((running, idx) => {
      if (!running) return;
      running.remaining -= 1;
      if (running.remaining <= 0) {
        running.finish = now;
        this.finished.push(running);
        this.cpus[idx] = null;
        this.cpuStartTimes[idx] = null; // Clean up CPU tracking
        this.bus.emit('taskFinish', running);
      }
    });
    
    // 3. schedule
    this.cpus.forEach((running, idx) => {
      if (running) return;
      const next = this.scheduler.next(idx, now);
      if (next) {
        if (next.start === null) next.start = now;
        this.cpus[idx] = next;
        this.cpuStartTimes[idx] = now; // Track when this task started on this CPU
        this.bus.emit('taskStart', { task: next, cpu: idx, now });
      }
    });
    
    // 4. Round‑Robin preemption (fixed timing)
    if (this.scheduler.timeSlice) {
      this.cpus.forEach((running, idx) => {
        if (!running || this.cpuStartTimes[idx] === null) return;
        const runTime = now - this.cpuStartTimes[idx];
        if (runTime >= this.scheduler.timeSlice()) {
          // Emit preemption event for better visualization
          this.bus.emit('taskPreempted', { task: running, now });
          
          // Preempt the task
          this.scheduler.add(running);
          this.cpus[idx] = null;
          this.cpuStartTimes[idx] = null;
        }
      });
    }
    
    this.bus.emit('state', { now, cpus: this.cpus, ready: [...this.scheduler.ready] });
  }

  #spawnRandomTask(now) {
    if (Math.random() > 0.3) return; // 30% chance each tick
    
    // Generate more didactic task IDs
    const taskCounter = this.finished.length + Object.values(this.cpus).filter(Boolean).length + this.scheduler.ready.length + 1;
    const id = `P${taskCounter}`;
    
    const duration = 2 + Math.floor(Math.random() * 6); // [2…7]
    const deadline = now + duration + (2 + Math.floor(Math.random() * 8));
    const task = new Task({ id, arrival: now, duration, deadline });
    this.scheduler.add(task);
    this.bus.emit('taskArrival', task);
  }

  start() { 
    this.clock.start(this.bus); 
  }
  
  stop() { 
    this.clock.stop(); 
  }
}
