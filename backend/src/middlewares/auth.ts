import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role?: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);

    if (!config.jwtSecret) {
      res.status(500).json({ message: 'JWT secret not configured' });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      username: string;
      email: string;
      role?: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token' });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
    } else {
      res.status(500).json({ message: 'Authentication error' });
    }
  }
};

export const requireInternalSecret = (req: Request, res: Response, next: NextFunction): void => {
  const internalSecret = req.headers['x-internal-secret'];

  if (!internalSecret || internalSecret !== config.internalSecret) {
    res.status(401).json({ message: 'Unauthorized: Invalid internal secret' });
    return;
  }

  next();
};

