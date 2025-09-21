
import app from "./app.js";
import cloudinary from "cloudinary";
import { initDatabases } from "./database/initDatabase.js";

// Konfigurimi i Cloudinary duke përdorur variablat e ambientit
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

// Initialize databases and start server
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // Initialize databases
    await initDatabases();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running at port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();