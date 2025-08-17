import jwt from 'jsonwebtoken';
// import secretKey from '../config/jwtConfig.js';

export default function generateToken(user, extraPayload = {}) {

    const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
        ...extraPayload
    }

    // return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
}
