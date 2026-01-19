export const LOG_COLORS = {
  SPAWN: 'color: #2ecc71; font-weight: bold',
  COLLISION: 'color: #e74c3c; font-weight: bold',
  HIT: 'color: #f39c12; font-weight: bold',
  DESTROY: 'color: #9b59b6; font-weight: bold',
  CASH: 'color: #f1c40f; font-weight: bold',
  STAR: 'color: #3498db; font-weight: bold',
  BUSTED: 'color: #e74c3c; font-weight: bold; font-size: 14px',
  DAMAGE: 'color: #e67e22; font-weight: bold',
  DEMO: 'color: #1abc9c; font-weight: bold',
  STATE: 'color: #95a5a6',
} as const;

export type LogCategory = keyof typeof LOG_COLORS;

export const log = (category: LogCategory, message: string, data?: unknown): void => {
  const style = LOG_COLORS[category];
  const now = new Date();
  const ts = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  if (data !== undefined) {
    console.log(`%c[${ts}][${category}] ${message}`, style, data);
  } else {
    console.log(`%c[${ts}][${category}] ${message}`, style);
  }
};
