import jwt from "jsonwebtoken";

const resolveSecret = (secret) => secret || process.env.JWT_SECRET;

const generateToken = (id, options = {}) => {
  const { secret, expiresIn = "30d" } = options;
  return jwt.sign({ id }, resolveSecret(secret), { expiresIn });
};

const verifyToken = (token, options = {}) => {
  const { secret } = options;
  return jwt.verify(token, resolveSecret(secret));
};

export { generateToken, verifyToken };
