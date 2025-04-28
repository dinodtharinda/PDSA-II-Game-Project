// Browser-compatible logger implementation
const browserLogger = {
  info: (message) => console.log(`%c[INFO] ${message}`, 'color: blue'),
  warn: (message) => console.warn(`[WARN] ${message}`),
  error: (message) => console.error(`[ERROR] ${message}`),
  debug: (message) => console.debug(`%c[DEBUG] ${message}`, 'color: gray'),
  http: (message) => console.log(`%c[HTTP] ${message}`, 'color: purple'),
  verbose: (message) => console.log(`%c[VERBOSE] ${message}`, 'color: teal'),
  silly: (message) => console.log(`%c[SILLY] ${message}`, 'color: magenta')
};

// Export the browser logger
export default browserLogger;