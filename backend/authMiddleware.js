const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado, no se proporcionó un token' });
  }

  try {
    // Verificar el token con la clave secreta
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Añadir el usuario decodificado a la solicitud
    next(); // Continuar al siguiente middleware o controlador
  } catch (error) {
    res.status(400).json({ error: 'Token inválido' });
  }
};

module.exports = authMiddleware;