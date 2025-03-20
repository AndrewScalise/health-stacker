const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Server configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_PREFIX = '/api';

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthstack';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_should_be_in_env_file';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const JWT_COOKIE_EXPIRE = process.env.JWT_COOKIE_EXPIRE || 7;

// CORS configuration
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@healthstack.com';

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Export all environment variables
module.exports = {
  PORT,
  NODE_ENV,
  API_PREFIX,
  MONGODB_URI,
  JWT_SECRET,
  JWT_EXPIRE,
  JWT_COOKIE_EXPIRE,
  CORS_ORIGIN,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASSWORD,
  EMAIL_FROM,
};