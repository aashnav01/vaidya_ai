require('dotenv').config();
const mongoose = require('mongoose');

async function reset() {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.collection('patients').drop().catch(() => {});
  await mongoose.connection.collection('consultations').drop().catch(() => {});
  console.log('Collections dropped');
  process.exit(0);
}

reset();
