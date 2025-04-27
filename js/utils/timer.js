/**
 * Timer utility for measuring execution time
 */
class Timer {
  constructor() {
    this.startTime = null;
    this.endTime = null;
  }

  start() {
    this.startTime = performance.now();
    this.endTime = null;
    return this.startTime;
  }

  stop() {
    if (this.startTime === null) {
      throw new Error('Timer is not running.');
    }
    if (this.endTime !== null) {
      throw new Error('Timer is not running.');
    }
    this.endTime = performance.now();
    return this.endTime - this.startTime;
  }

  getElapsedTimeMs() {
    if (this.startTime === null || this.endTime === null) {
      return 0;
    }
    return this.endTime - this.startTime;
  }

  getDurationInSeconds() {
    return this.getElapsedTimeMs() / 1000;
  }

  reset() {
    this.startTime = null;
    this.endTime = null;
  }
}

// Helper function for UI performance optimizations
export function debounce(func, wait = 100) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export default Timer;