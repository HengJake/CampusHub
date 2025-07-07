import jwt from 'jsonwebtoken';
// import secretKey from '../config/jwtConfig.js';

export default function generateToken(user) {

    const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
        ...(user.role === "schoolAdmin" ? "" : "schoolId")
    }
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}