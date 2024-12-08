import { createApp } from './app';
import dotenv from 'dotenv';

dotenv.config();

async function start() {
  const app = createApp();  
  app.listen(process.env["PORT"], () => {
    console.log(`Server listening on port ${process.env["PORT"]}`);
  });
}

start();
