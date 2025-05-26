import { HttpExceptionStatusCodes } from '../types';

export class ApiError extends Error {

  constructor(public message: string, public status: HttpExceptionStatusCodes) {
    super(message);
    this.status = status;
  }
}