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


