const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();

// Database connection
const { MongoClient } = require('mongodb');

app.use(cors());
app.use(express.json());

// Connection URI (better to use environment variables in production)
// ------ Ubuntu ------
//const uri = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000';
// ------ Windows ------
const uri = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.1';

// Create a new MongoClient (singleton pattern)
let db; // Global db instance to reuse

async function connectToDatabase() {
  if (db) return db; // Return cached connection if exists

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected successfully to MongoDB');
    db = client.db('myDatabase'); // Replace with your DB name
    return db;
  } catch (err) {
    console.error('❌ Error connecting to MongoDB', err);
    process.exit(1); // Exit if DB connection fails
  }
}

// Make DB connection available in routes
app.use(async (req, res, next) => {
  try {
    req.db = await connectToDatabase();
    next();
  } catch (err) {
    res.status(500).send('Database connection error');
  }
});

// Routes
app.get('/', (req, res) => {
  res.send('SIMPLE CRUD IS RUNNING 🚀');
});

// Example CRUD route (GET all users)
app.get('/users', async (req, res) => {
  try {
    const users = await req.db.collection('users').find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Start server only if DB connects
connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
});