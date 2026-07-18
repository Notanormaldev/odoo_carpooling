import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT;
const ACCESS_TOKEN_EXPIRY = '1d';  // 1 day — refresh token handles long-term security
const REFRESH_TOKEN_EXPIRY = '7d';

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

export const generateTokenPair = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    orgId: user.orgId,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export default { generateAccessToken, generateRefreshToken, generateTokenPair, verifyToken };
