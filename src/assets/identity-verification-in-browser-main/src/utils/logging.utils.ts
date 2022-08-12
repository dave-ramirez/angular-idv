import { getDevMode as globalGetDevMode } from '../global';

/**
 * Loggs content only if dev mode.
 * @param content Content.
 */
export function consoleLog(message?: unknown, ...optionalParams: unknown[]): void {
  const devMode = globalGetDevMode();
  if (devMode === true) {
    console.log(message, ...optionalParams);
  }
}

/**
 * Loggs content only if dev mode.
 * @param content Content.
 */
export function consoleError(message?: unknown, ...optionalParams: unknown[]): void {
  const devMode = globalGetDevMode();
  if (devMode === true) {
    console.error(message, ...optionalParams);
  }
}

/**
 * Loggs content only if dev mode.
 * @param content Content.
 */
export function consoleWarn(message?: unknown, ...optionalParams: unknown[]): void {
  const devMode = globalGetDevMode();
  if (devMode === true) {
    console.warn(message, ...optionalParams);
  }
}