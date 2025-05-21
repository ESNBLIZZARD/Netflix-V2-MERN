import jwt from 'jsonwebtoken';
import { ENV_VARS } from '../config/enVars.js';
 
export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, ENV_VARS.JWT_SECRET, {
        expiresIn: '30d',
    });
    res.cookie('jwt-netflix', token, {
        httpOnly: true, // prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV !== 'development', // Set to true in production
        sameSite: 'strict', // CSRF protection
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    return token;
}