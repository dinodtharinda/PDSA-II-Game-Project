/**
 * Timer utility for measuring algorithm performance
 */
class Timer {
  constructor() {
    this.startTime = 0;
    this.endTime = 0;
    this.running = false;
  }

  /**
   * Start the timer
   */
  start() {
    this.startTime = process.hrtime.bigint();
    this.running = true;
    return this;
  }

  /**
   * Stop the timer
   */
  stop() {
    if (!this.running) {
      throw new Error('Timer is not running');
    }
    this.endTime = process.hrtime.bigint();
    this.running = false;
    return this;
  }

  /**
   * Reset the timer
   */
  reset() {
    this.startTime = 0;
    this.endTime = 0;
    this.running = false;
    return this;
  }

  /**
   * Get elapsed time in milliseconds
   */
  getElapsedTimeMs() {
    if (this.running) {
      const currentTime = process.hrtime.bigint();
      return Number(currentTime - this.startTime) / 1000000;
    }
    return Number(this.endTime - this.startTime) / 1000000;
  }

  /**
   * Execute a function and measure its execution time
   * @param {Function} fn - Function to execute
   * @param {Array} args - Arguments to pass to the function
   * @returns {Object} Object containing the execution time and function result
   */
  static measure(fn, ...args) {
    const timer = new Timer().start();
    const result = fn(...args);
    timer.stop();
    
    return {
      executionTimeMs: timer.getElapsedTimeMs(),
      result
    };
  }

  /**
   * Execute an async function and measure its execution time
   * @param {Function} fn - Async function to execute
   * @param {Array} args - Arguments to pass to the function
   * @returns {Promise<Object>} Promise resolving to object with execution time and function result
   */
  static async measureAsync(fn, ...args) {
    const timer = new Timer().start();
    const result = await fn(...args);
    timer.stop();
    
    return {
      executionTimeMs: timer.getElapsedTimeMs(),
      result
    };
  }
}

module.exports = Timer;