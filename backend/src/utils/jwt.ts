import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface JwtPayloadData {
  id: string;
  email?: string;
  role: string;
  staffId?: string;
  name?: string;
}

export function signToken(payload: JwtPayloadData): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (jwt as any).sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiration,
  });
}

export function verifyToken(token: string): JwtPayloadData | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (jwt as any).verify(token, config.jwtSecret) as JwtPayloadData;
  } catch {
    return null;
  }
}
