const User = require('./models/User');
const sequelize = require('./config/database');
const bcrypt = require('bcrypt');

async function createTestUser() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { username: 'dineshkavitha' }
    });
    
    if (existingUser) {
      console.log('User dineshkavitha already exists');
      process.exit(0);
    }
    
    // Create new user
    const user = await User.create({
      username: 'dineshkavitha',
      email: 'dineshkavitha@gmail.com',
      password: 'password123',
      fullName: 'Dinesh Kavitha'
    });
    
    console.log('✅ Test user created successfully:');
    console.log('  Username: dineshkavitha');
    console.log('  Email: dineshkavitha@gmail.com');
    console.log('  Password: password123');
    console.log('  Full Name: Dinesh Kavitha');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    process.exit(1);
  }
}

createTestUser();
