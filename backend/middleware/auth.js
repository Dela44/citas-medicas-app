const jwt = require('jsonwebtoken');
const db = require('../db');

function authenticateToken(req, res, next) {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Debes iniciar sesión para continuar.' });
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({ error: 'La sesión no es válida o ha expirado.' });
    }

    db.query(
        'SELECT id_usuario AS id, correo, rol, id_paciente AS pacienteId FROM usuarios WHERE id_usuario = ?',
        [payload.sub],
        (err, rows) => {
            if (err) return next(err);
            if (!rows.length) return res.status(401).json({ error: 'La cuenta ya no está disponible.' });
            req.user = rows[0];
            next();
        }
    );
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.rol)) {
            return res.status(403).json({ error: 'No tienes permisos para realizar esta operación.' });
        }
        next();
    };
}

module.exports = { authenticateToken, requireRole };
