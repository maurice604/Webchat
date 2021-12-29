const connection = require('./connection');

async function getAll() {
  const db = await connection();
  return db.collection('messages').find().toArray();
}

async function create({ chatMessage, nickname, date }) {
  const db = await connection();
  return db.collection('messages').insertOne({ chatMessage, nickname, date });
}

module.exports = { getAll, create }; 
