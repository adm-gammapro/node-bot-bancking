class AutomatorError extends Error {
  constructor(message: string) {
    // Llamamos al constructor de la clase padre (Error) con el mensaje de error
    super(message);

    // Capturamos el stack trace actual
    // (opcional, pero útil para el debugging)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AutomatorError);
    }
  }
}

export default AutomatorError;
