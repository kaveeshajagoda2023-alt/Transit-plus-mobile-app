export const logger = {
  info: (msg: string, ...meta: unknown[]) => {
    console.log(`\x1b[36m[TransitPulse INFO]\x1b[0m ${new Date().toISOString()} - ${msg}`, ...meta);
  },
  success: (msg: string, ...meta: unknown[]) => {
    console.log(`\x1b[32m[TransitPulse OK]\x1b[0m   ${new Date().toISOString()} - ${msg}`, ...meta);
  },
  warn: (msg: string, ...meta: unknown[]) => {
    console.warn(`\x1b[33m[TransitPulse WARN]\x1b[0m ${new Date().toISOString()} - ${msg}`, ...meta);
  },
  error: (msg: string, ...meta: unknown[]) => {
    console.error(`\x1b[31m[TransitPulse ERR]\x1b[0m  ${new Date().toISOString()} - ${msg}`, ...meta);
  },
  ws: (msg: string, ...meta: unknown[]) => {
    console.log(`\x1b[35m[TransitPulse WS]\x1b[0m   ${new Date().toISOString()} - ${msg}`, ...meta);
  },
};
