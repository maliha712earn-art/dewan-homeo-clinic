import app from './app';
import { config } from './config';
import prisma from './config/db';
import { bootstrapDatabase } from './utils/bootstrap.util';

const PORT = config.port || 5000;

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Automatically seed/update default admin and website settings
    await bootstrapDatabase();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🌿 দেওয়ান হোমিও ক্লিনিক (Deowan Homeo Clinic) running on 0.0.0.0:${PORT}`);
      console.log(`🔗 Web URL: http://0.0.0.0:${PORT}`);
      console.log(`🏥 Health: http://0.0.0.0:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
