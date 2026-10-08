import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayloadData } from '../utils/jwt.js';
import { db } from '../db/database.js';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayloadData;
}

export function authenticatePassenger(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authorization header missing or invalid format.' });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'PASSENGER') {
    res.status(401).json({ success: false, error: 'Invalid or expired commuter session token.' });
    return;
  }

  const passenger = db.findPassengerById(payload.id);
  if (!passenger) {
    res.status(401).json({ success: false, error: 'Commuter account no longer exists.' });
    return;
  }

  req.user = payload;
  next();
}

export function authenticateStaff(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Staff authorization token missing or invalid.' });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: 'Invalid or expired staff session token.' });
    return;
  }

  const staff = db.findStaffById(payload.id);
  if (!staff) {
    res.status(401).json({ success: false, error: 'Staff account not recognized.' });
    return;
  }

  req.user = payload;
  next();
}

export function requireStaffRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Requires one of roles: [${roles.join(', ')}]`,
      });
      return;
    }
    next();
  };
}
