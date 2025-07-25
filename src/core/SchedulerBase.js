export class SchedulerBase {
  constructor(cpuCount = 1) {
    this.ready = [];
    this.cpuCount = cpuCount;
  }
  
  add(task) { 
    this.ready.push(task); 
  }
  
  next(cpuIdx, now) { 
    return this._selectNext(cpuIdx, now); 
  }
  
  // eslint-disable-next-line no-unused-vars
  _selectNext(cpuIdx, now) { 
    throw new Error('Not implemented'); 
  }
}
