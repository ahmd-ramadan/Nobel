import { Request } from 'express';
import { UserRolesEnum } from '../enums';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: UserRolesEnum;
  };
}
