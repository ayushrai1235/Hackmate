import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Try loading .env.local first, fallback to .env
if (fs.existsSync(path.resolve('.env.local'))) {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}
