import jwt from "jsonwebtoken";


export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

// =======new era=======

export const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: Login Again" });
  }

  try {
    const tokenDecode = verifyToken(token);

    if (tokenDecode.id) {
      req.body.id = tokenDecode.id;
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Login Again" });
    }

    next();
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Middleware to check if user has the required role(s)
export const authRole = (roles) => (req, res, next) => {
  // roles can be a string or array
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized: Login Again" });
  }

  try {
    const tokenDecode = verifyToken(token);
    if (!tokenDecode.role || !allowedRoles.includes(tokenDecode.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: Insufficient role" });
    }
    // Optionally attach role to req
    req.userRole = tokenDecode.role;
    req.userId = tokenDecode.id;
    req.userSchoolId = tokenDecode.schoolId; // for school admin
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


