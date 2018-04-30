require('dotenv').config();
// const imageDownloader = require('./imageDownloader');
const imageFormatter = require('./imageFormatter');

const start = async () => {
  await imageFormatter();
};

start().catch(e => console.error(e));
