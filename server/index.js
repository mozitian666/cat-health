console.log('Starting server initialization...');

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

try {
  const express = require('express');
  console.log('Loaded express');
  const cors = require('cors');
  console.log('Loaded cors');
  const path = require('path');
  console.log('Loaded path');
  const { sequelize } = require('./models');
  console.log('Loaded models');
  const apiRoutes = require('./routes/api');
  console.log('Loaded api routes');

  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Routes
  app.use('/api', apiRoutes);

  // Serve Frontend Static Files (Production)
  // Serve static files from the React app build directory
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });

  // Database Sync & Start Server
  async function startServer() {
    console.log('Attempting to sync database...');
    try {
      await sequelize.sync({ alter: true }); // Set alter: true to update db schema
      console.log('Database synced successfully.');
      
      const server = app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
      
      server.on('error', (e) => {
          console.error('SERVER ERROR:', e);
      });
      
      // Keep alive check
      setInterval(() => {
          // console.log('Heartbeat...');
      }, 10000);
      
    } catch (error) {
      console.error('Unable to sync database:', error);
    }
  }

  startServer();
} catch (err) {
  console.error('CRITICAL ERROR:', err);
}
