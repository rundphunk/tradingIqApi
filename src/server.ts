<<<<<<< HEAD
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
=======
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
>>>>>>> a34b550ff69e15b298aff73a6573db3d2f9b064e
