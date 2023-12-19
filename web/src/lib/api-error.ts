export interface ApiErrorProps {
  message: string;
  statusCode?: number;
  data?: any;
}

export class ApiError extends Error {
  message: string;
  statusCode?: number;
  data?: any;

  constructor({ message, statusCode, data }: ApiErrorProps) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
  }
}
