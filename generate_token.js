require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/triplog';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

mongoose.connect(DB_URI).then(async () => {
  const User = require('./src/models/User');
  let user = await User.findOne().sort({ createdAt: -1 });
  
  if (!user) {
    user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
  }
  
  const token = jwt.sign(
    { id: user._id.toString(), email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
  
  console.log('USER:', user.email);
  console.log('TOKEN:', token);
  console.log('\nUSE THIS IN SWAGGER:');
  console.log('Bearer ' + token);
  
  await mongoose.connection.close();
  process.exit(0);
}).catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
