import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
export function signToken(payload) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.jwtExpiration,
    });
}
export function verifyToken(token) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return jwt.verify(token, config.jwtSecret);
    }
    catch {
        return null;
    }
}
