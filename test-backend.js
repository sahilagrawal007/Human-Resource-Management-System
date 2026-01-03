// Quick test script to check backend connection
const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testBackend() {
  console.log('🔍 Testing backend connection...\n');

  // Test 1: Check if server is running
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email: 'test@test.com',
      password: 'test123',
      fullName: 'Test User',
      jobTitle: 'Developer',
      department: 'Engineering'
    });
    console.log('✅ Backend is running and responding');
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.log('❌ Backend is NOT running');
      console.log('   → Start backend: cd backend && npm start');
      return;
    } else if (error.response) {
      console.log('✅ Backend is running (got response)');
      if (error.response.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('   → Database is connected (email exists check worked)');
      }
    } else {
      console.log('❌ Unknown error:', error.message);
    }
  }

  // Test 2: Check database connection
  console.log('\n🔍 Testing database connection...');
  try {
    const { PrismaClient } = require('./backend/node_modules/@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Database connection successful');
    await prisma.$disconnect();
  } catch (error) {
    console.log('❌ Database connection failed');
    console.log('   → Check DATABASE_URL in backend/.env');
    console.log('   → Error:', error.message);
  }
}

testBackend();

