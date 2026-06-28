export class InvalidPreferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPreferenceError";
  }
}
