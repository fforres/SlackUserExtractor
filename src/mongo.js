const { MongoClient } = require('mongodb');

let mongoClient = null;

const {
  MONGODB_URL_FULL,
  MONGODB_DATABASE,
  MONGODB_USERS_COLLECTION,
} = process.env;

module.exports.getMongoCollection = async () => {
  if (!mongoClient) {
    mongoClient = await MongoClient.connect(MONGODB_URL_FULL);
  }
  const db = mongoClient.db(MONGODB_DATABASE);
  const col = db.collection(MONGODB_USERS_COLLECTION);
  return col;
};
