
import app from "./app.js";
import { initDatabases } from "./database/initDatabase.js";


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