export class CodeError extends Error {
  constructor(readonly code: string, message: string) {
    super(message)
  }
}