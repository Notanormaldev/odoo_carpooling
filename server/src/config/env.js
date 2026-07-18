import dotenv from 'dotenv';
import path from 'path';

// Load .env from parent directory (root) first
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

// Load .env from current directory (fallback)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('🔌 Environment variables initialized');
