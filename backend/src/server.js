/**
 * @fileoverview Server entry point
 * @module server
 */

require('dotenv').config();

const app = require('./app');
const { initDb } = require('./integration/db');


const PORT = process.env.PORT || 3000;

/**
 * Function for starting the server, it initializes the database. by calling initDb
 * and listens on port 3000.
 * 
 */
async function startServer() {
  try {
    await initDb();
    console.log('Database initialized');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  } 
}

startServer();