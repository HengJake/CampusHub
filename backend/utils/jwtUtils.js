import jwt from 'jsonwebtoken';
// import secretKey from '../config/jwtConfig.js';

export default function generateToken(user, extra = {}) {

    const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
        ...extra
    }
    
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}