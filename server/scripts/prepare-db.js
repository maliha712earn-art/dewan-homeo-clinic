const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
const provider = isPostgres ? 'postgresql' : 'sqlite';

const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Update provider in schema.prisma dynamically
schemaContent = schemaContent.replace(/provider\s*=\s*"(sqlite|postgresql)"/, `provider = "${provider}"`);

fs.writeFileSync(schemaPath, schemaContent, 'utf8');
console.log(`🌿 Prisma schema configured for: [${provider.toUpperCase()}]`);
