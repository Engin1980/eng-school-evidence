// Universal logger: `const log = createLogger('auth'); log.info('message', data)`.
// Level (debug | info | warn | error | off) is taken from localStorage `logLevel`,
// else from VITE_LOG_LEVEL, else `debug`. Change at runtime in the browser console:
//   localStorage.logLevel = 'warn'  (then reload)
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, off: 99 };
const COLORS = { debug: '#888', info: '#2a7ae2', warn: '#d98b00', error: '#d93025' };

function currentLevel() {
  let name;
  try {
    name = localStorage.getItem('logLevel');
  } catch {
    // localStorage unavailable
  }
  name = name || import.meta.env?.VITE_LOG_LEVEL || 'debug';
  return LEVELS[name] ?? LEVELS.debug;
}

export function createLogger(namespace) {
  const emit = (level, args) => {
    if (LEVELS[level] < currentLevel()) return;
    const time = new Date().toISOString().slice(11, 23);
    const method = level === 'debug' ? 'log' : level;
    console[method](
      `%c${time} ${level.toUpperCase()} [${namespace}]`,
      `color:${COLORS[level]};font-weight:bold`,
      ...args,
    );
  };
  return {
    debug: (...args) => emit('debug', args),
    info: (...args) => emit('info', args),
    warn: (...args) => emit('warn', args),
    error: (...args) => emit('error', args),
  };
}

// Hides the one-time code in a sign-in link so it is not left in the console.
export const maskLink = (url) => (url || '').replace(/(oobCode=)[^&#]+/, '$1***');
