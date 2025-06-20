import { app } from "./app.js";
import dotenv from "dotenv"
import { initDatabase } from "./config/database.js"
import fileRoutes from "./routes/file.routes.js"
import userRoutes from "./routes/user.routes.js"
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from "express"
import cors from "cors"
import net from 'net';
import fs from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Load JWT secret from file if not in environment
if (!process.env.JWT_SECRET) {
  try {
    const jwtSecretPath = path.join(__dirname, 'jwt_secret.txt');
    if (fs.existsSync(jwtSecretPath)) {
      const secret = fs.readFileSync(jwtSecretPath, 'utf8').trim();
      process.env.JWT_SECRET = secret;
      console.log('✅ JWT secret loaded from file');
    } else {
      console.warn('⚠️ JWT secret file not found, using default');
      process.env.JWT_SECRET = 'safedrop-default-secret-key';
    }
  } catch (error) {
    console.error('❌ Error loading JWT secret:', error);
    process.env.JWT_SECRET = 'safedrop-default-secret-key';
  }
}

const DEFAULT_PORT = 6600;
let PORT = process.env.PORT || DEFAULT_PORT;
const CLIENT_PORT = 5173;

// Set default URLs
process.env.CLIENT_URL = process.env.CLIENT_URL || `http://localhost:${CLIENT_PORT}`;
process.env.SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

// Function to check if a port is in use
const isPortInUse = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => {
        // Port is in use
        resolve(true);
      })
      .once('listening', () => {
        // Port is free
        server.close();
        resolve(false);
      })
      .listen(port);
  });
};

// Function to find an available port
const findAvailablePort = async (startPort) => {
  let port = startPort;
  while (await isPortInUse(port)) {
    console.log(`Port ${port} is in use, trying ${port + 1}...`);
    port++;
  }
  return port;
};
      
const startServer = async () => {
  try {
    // Find available port
    PORT = await findAvailablePort(PORT);
    console.log(`🔄 Using port: ${PORT}`);
    
    // Update server URL if port changed
    if (PORT !== DEFAULT_PORT) {
      process.env.SERVER_URL = `http://localhost:${PORT}`;
    }
    
    console.log(`🔄 Client URL: ${process.env.CLIENT_URL}`);
    console.log(`🔄 Server URL: ${process.env.SERVER_URL}`);
    
    // Initialize database connection
    await initDatabase();

    // Register routes
    app.use("/api/files", fileRoutes);
    app.use("/api/users", userRoutes);

    // Serve static files
    app.use(express.static(path.join(__dirname, '../../client')));
    
    // Serve uploads directory
    app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

    // Handle shared file routes
    app.get('/f/:shortCode', (req, res) => {
      res.redirect(`${process.env.CLIENT_URL}/f/${req.params.shortCode}`);
    });

    app.listen(PORT, () => {
      console.log(`✅ Server is running at ${process.env.SERVER_URL}`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
  }
};
  
startServer();