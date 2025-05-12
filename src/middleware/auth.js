const jwt = require('jsonwebtoken');
const { ForbiddenError, UnauthorizedError } = require("./error");
const User = require("../models/user");

module.exports.auth = function (_permittedRoles) {

  const permittedRoles = [..._permittedRoles];
  return async (req, res, next) => {
    try {
      const token = extractTokenBasedOnRequestPlatform(req);
      if (!token) throw new UnauthorizedError("token not provided");
      const decodedToken = verifyAndDecodeToken(token);
      const isPermitted = await isUserRolePermitted(decodedToken.userId, permittedRoles);
      if (isPermitted) {
        req.userId = decodedToken.userId || null;
        req.role = decodedToken.role || null
        next();
      }
      else {
        throw new ForbiddenError("forbidden");
      }
    } catch (err) {
      next(err);
    }
  };
};

module.exports.anonymasAuth = function (_permittedRoles) {

  return async (req, res, next) => {
    try {
      const token = extractTokenBasedOnRequestPlatform(req);
      if (token) {
        const permittedRoles = [..._permittedRoles];
        const decodedToken = verifyAndDecodeToken(token);
        const isPermitted = await isUserRolePermitted(decodedToken.userId, permittedRoles);
        if (isPermitted) {
          req.userId = decodedToken.userId || null;
          req.role = decodedToken.role || null
          next();
        }
      }
      else {
        next();
      }
    } catch (err) {
      next(err);
    }
  };
}


function extractTokenBasedOnRequestPlatform(req) {
  if (req.headers.authorization) return req.headers.authorization.split(' ')[1];
  return null;
}

function verifyAndDecodeToken(token) {
  try {
    let decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decodedToken) throw new ForbiddenError("forbidden");

    return decodedToken;
  } catch (err) {
    if (err.name == 'TokenExpiredError') throw new UnauthorizedError("Token Expired")
    throw new ForbiddenError("forbidden");
  }
}

async function isUserRolePermitted(userId, permittedRoles) {
  const user = await User.findById(userId);
  if (!user) throw new UnauthorizedError("User Not Found");
  if (!user.isActive) throw new UnauthorizedError("User suspended");

  if (user && permittedRoles.includes(user.role)) return true
  return false;
}


exports.authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(UNAUTHORIZED).json({ message: "No token provided" });
    }
  
    const token = authHeader.split(" ")[1];
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  
      // Optionally fetch user from DB
      const user = await User.findById(decoded.userId).select("-password"); // exclude password
      if (!user) {
        return res.status(UNAUTHORIZED).json({ message: "User not found" });
      }
  
      req.user = user;
      next();
    } catch (err) {
      return res.status(UNAUTHORIZED).json({ message: "Invalid token" });
    }
  };
  