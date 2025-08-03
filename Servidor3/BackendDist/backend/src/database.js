import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DB,        // db_informacion
  process.env.MYSQL_USER,      // root
  process.env.MYSQL_PASSWORD,  // root
  {
    host: process.env.MYSQL_HOST,  // maestro1
    dialect: 'mysql',
    port: process.env.MYSQL_PORT || 3306,
    logging: false,
  }
);


const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MySQL exitosa');

    // Aquí puedes sincronizar tus modelos
    await sequelize.sync({ alter: true }); // O { force: true } si quieres recrear las tablas
    console.log('Modelos sincronizados con la base de datos');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
  }
};

// Exporta tanto la conexión como el objeto `sequelize`
export { sequelize, connection };
