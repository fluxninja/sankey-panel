const SHOULD_LOG = true;

export const logger = fnLogger();

function fnLogger(shouldLog = SHOULD_LOG) {
  if (!shouldLog) {
    return {
      warn: (..._: any[]) => undefined,
      error: (..._: any[]) => undefined,
      log: (..._: any[]) => undefined,
    };
  }

  return {
    warn: console.warn,
    error: console.error,
    log: console.log,
  };
}
