const bcrypt = require('bcryptjs');
const db = require('./db');

async function initializeAuth() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error('Configura JWT_SECRET con al menos 32 caracteres en backend/.env.');
    }

    await db.promise().query(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id_usuario INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            correo VARCHAR(254) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            rol ENUM('ADMIN', 'PACIENTE') NOT NULL,
            id_paciente INT NULL,
            creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_usuarios_paciente (id_paciente)
        )
    `);

    const correo = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const password = String(process.env.ADMIN_PASSWORD || '');
    if (!correo && !password) {
        console.warn('Administrador no inicializado: configura ADMIN_EMAIL y ADMIN_PASSWORD en backend/.env.');
        return;
    }
    if (!correo || password.length < 12) {
        throw new Error('Configura ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 12 caracteres) para crear el administrador.');
    }

    const [existing] = await db.promise().query(
        'SELECT id_usuario, rol FROM usuarios WHERE correo = ?',
        [correo]
    );
    if (existing.length) {
        if (existing[0].rol !== 'ADMIN') {
            throw new Error('ADMIN_EMAIL ya pertenece a una cuenta que no es administradora.');
        }
        return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await db.promise().query(
        'INSERT INTO usuarios (correo, password_hash, rol) VALUES (?, ?, ?)',
        [correo, passwordHash, 'ADMIN']
    );
    console.log('Cuenta de administrador inicializada.');
}

module.exports = initializeAuth;
