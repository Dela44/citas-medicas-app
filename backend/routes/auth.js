const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createToken(user) {
    return jwt.sign({ role: user.rol }, process.env.JWT_SECRET, {
        subject: String(user.id),
        expiresIn: '8h',
    });
}

router.post('/register', async (req, res, next) => {
    const nombres = String(req.body.nombres || '').trim();
    const apellidos = String(req.body.apellidos || '').trim();
    const dni = String(req.body.dni || '').trim();
    const correo = String(req.body.correo || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const fechaNacimiento = req.body.fechaNacimiento || null;
    const telefono = String(req.body.telefono || '').trim() || null;

    if (!nombres || !apellidos || !dni || !correo || !password) {
        return res.status(400).json({ error: 'Completa nombres, apellidos, DNI, correo y contraseña.' });
    }
    if (!emailPattern.test(correo) || correo.length > 254) {
        return res.status(400).json({ error: 'El correo no tiene un formato válido.' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }
    if (!/^\d{8}$/.test(dni)) {
        return res.status(400).json({ error: 'El DNI debe contener exactamente 8 dígitos.' });
    }

    const connection = await db.promise().getConnection().catch(next);
    if (!connection) return;

    try {
        await connection.beginTransaction();
        const [existing] = await connection.query(
            'SELECT id_usuario FROM usuarios WHERE correo = ? UNION SELECT id_paciente FROM pacientes WHERE dni = ? LIMIT 1',
            [correo, dni]
        );
        if (existing.length) {
            await connection.rollback();
            return res.status(409).json({ error: 'Ya existe una cuenta con ese correo o DNI.' });
        }

        const [patientResult] = await connection.query(
            'INSERT INTO pacientes (nombres, apellidos, dni, fecha_nacimiento, telefono) VALUES (?, ?, ?, ?, ?)',
            [nombres, apellidos, dni, fechaNacimiento, telefono]
        );
        const passwordHash = await bcrypt.hash(password, 12);
        const [userResult] = await connection.query(
            'INSERT INTO usuarios (correo, password_hash, rol, id_paciente) VALUES (?, ?, ?, ?)',
            [correo, passwordHash, 'PACIENTE', patientResult.insertId]
        );
        await connection.commit();

        const user = { id: userResult.insertId, correo, rol: 'PACIENTE', pacienteId: patientResult.insertId };
        res.status(201).json({ token: createToken(user), user });
    } catch (err) {
        await connection.rollback();
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya existe una cuenta con ese correo o DNI.' });
        }
        next(err);
    } finally {
        connection.release();
    }
});

router.post('/login', async (req, res, next) => {
    const correo = String(req.body.correo || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!correo || !password) {
        return res.status(400).json({ error: 'Ingresa tu correo y contraseña.' });
    }

    try {
        const [rows] = await db.promise().query(
            'SELECT id_usuario AS id, correo, password_hash AS passwordHash, rol, id_paciente AS pacienteId FROM usuarios WHERE correo = ?',
            [correo]
        );
        const user = rows[0];
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
        }
        delete user.passwordHash;
        res.json({ token: createToken(user), user });
    } catch (err) {
        next(err);
    }
});

router.get('/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
