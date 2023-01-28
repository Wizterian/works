export default class TimerModel {  
  constructor() {
    this._currentTime = 0;
    this._timeRatio = 1;
    TimerModel._instance = this;
  }

  static getInstance() {
    return TimerModel._instance || new TimerModel();
  }

  getTimeRatio() {
    return this._timeRatio;
  }

  updateTimeRatio() {
    const lastTime = this._currentTime;
    const fps60 = 1000 / 60;
    const timeDiff = new Date().getTime() - lastTime;
    this._timeRatio = Math.round((timeDiff / fps60 * 10) / 10) >= 2 ? 2 : 1;
    this._currentTime = new Date().getTime();
  }
}