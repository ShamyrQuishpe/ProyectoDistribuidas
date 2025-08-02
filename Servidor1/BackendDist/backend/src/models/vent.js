import { DataTypes } from 'sequelize';
import { sequelize } from '../database.js';

const Vent = sequelize.define('Venta', {
  fechaVenta: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  productos: {
    type: DataTypes.JSON, // array de productos con cantidad, precio, subtotal
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },
  tipoPago: {
    type: DataTypes.ENUM('efectivo', 'transferencia'),
    allowNull: false
  },
  numeroDocumento: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  descripcionDocumento: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nombreCliente: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cedulaCliente: {
    type: DataTypes.STRING,
    allowNull: false
  },
  observacion: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'ventas',
  timestamps: false
});

export default Vent;
