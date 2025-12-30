const User = require('./models/User');
const sequelize = require('./config/database');

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    
    const users = await User.findAll({ 
      attributes: ['id', 'username', 'email', 'fullName'],
      limit: 10 
    });
    
    console.log('Users in database:', users.length > 0 ? users.map(u => u.toJSON()) : 'No users found');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
