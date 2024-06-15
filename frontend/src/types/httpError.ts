class HttpError extends Error {
  /** HTTP status code */
  statusCode: number;

  /**
   * @param message - Error message
   * @param statusCode - Http status code
   */
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default HttpError;
