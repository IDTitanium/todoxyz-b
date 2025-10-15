// authMiddleware.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-super-secret-key'; // 🔒 Ideally store in process.env.JWT_SECRET

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).end(); // Unauthorized
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.user = user;
    next();
  });
}
