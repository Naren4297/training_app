require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5433,
        dialect: process.env.DB_DIALECT || 'postgres',
        logging: false, // Optional: Disables SQL query logging
    }
);

// Test the connection
function testConnection() {
    try {
        console.log('Attempting to connect to the database...');
        sequelize.authenticate();
        console.log('Database connection established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection();

module.exports = sequelize;

