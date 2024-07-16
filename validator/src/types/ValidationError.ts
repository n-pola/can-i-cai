import { ErrorObject } from 'ajv';

export class ValidationError extends Error {
  data: (ErrorObject | string)[];

  constructor(data: (ErrorObject | string)[]) {
    super('Validation failed');
    this.data = data;
  }
}
