import mongoose from 'mongoose';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

try {
  await connectDB();
} catch (err) {
  console.error(`Could not connect to MongoDB: ${err.message}`);
  process.exit(1);
}

const server = app.listen(env.port, () => {
  console.log(`Todo API running on http://localhost:${env.port} (${env.nodeEnv})`);
});

const shutdown = () => server.close(async () => { await mongoose.disconnect(); process.exit(0); });
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
