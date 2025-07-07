// backend/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Keep this to help mysql2 driver
    timezone: 'Z',
    // --- ADD THIS TO SET SESSION TIMEZONE ---
    // This will run a SET time_zone = '+00:00' command for each connection
    // ensuring MySQL understands incoming/outgoing DATETIME as UTC.
    namedPlaceholders: true, // Optional but good practice for clarity
    insecureAuth: true // Depending on MySQL version and auth method
});

// Add a connection hook to set timezone for each new connection from the pool
// This is a robust way if global config isn't possible.
pool.on('connection', function (connection) {
    connection.execute("SET time_zone = '+00:00';", function (error) {
        if (error) {
            console.error("Error setting connection timezone:", error);
        } else {
            console.log("MySQL connection timezone set to UTC.");
        }
    });
});

module.exports = pool;