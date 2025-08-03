import { DataTypes } from 'sequelize';
import { sequelize } from '../database.js';

const Product = sequelize.define('Product', {
  codigoBarras: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  descripcion: { 
    type: DataTypes.STRING,
    allowNull: false
  },
  nombreProducto: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'products',
  timestamps: false
});

export default Product;
