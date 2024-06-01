import { verifyToken as verifyAuthorization } from "../utill/Jwt.js";
const verifyToken = async(req, res, next) => {
  const token = req.cookies?.["x-access-token"];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  const decodedValue = await verifyAuthorization(token);
  if (decodedValue) {
    req.session = {
      userId: decodedValue?.userId,
      authName: decodedValue?.authName,
    };
    next();
  } else {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export default verifyToken;
