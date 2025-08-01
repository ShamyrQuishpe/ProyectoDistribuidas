import { DataTypes } from 'sequelize';
import { sequelize } from '../database.js';  // Asumimos que tu conexión a la base de datos se encuentra en 'config/db.js'
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cedula: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,  // Aseguramos que el email sea único
        validate: {
            isEmail: true,  // Validamos que el campo sea un email
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'users',
    timestamps: true  // Sequelize maneja automáticamente `createdAt` y `updatedAt`
});

// Método para encriptar contraseñas
User.prototype.encrypPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    const passwordEncryp = await bcrypt.hash(password, salt);
    return passwordEncryp;
};

// Método para comparar contraseñas
User.prototype.matchPassword = async function (password) {
    const response = await bcrypt.compare(password, this.password);
    return response;
};

// Método para crear un token único
User.prototype.crearToken = function () {
    const tokenGenerado = Math.random().toString(36).substr(2);  // Generamos un token aleatorio
    return tokenGenerado;
};

export default User;
