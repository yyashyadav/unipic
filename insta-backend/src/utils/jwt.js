import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET ;

export function generateToken(payload) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '15m' });
}

//genrating the refresh token
export function generateRefreshToken(){
    return crypto.randomBytes(40).toString('hex');
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (err) {
        return null;
    }
}