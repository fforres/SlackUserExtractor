require('dotenv').config();
const slackToMongoSync = require('./slackToMongoSync');
const imageDownloader = require('./imageDownloader');
const imageFormatter = require('./imageFormatter');

const start = async () => {
  console.time('fullExecutionTime');
  await slackToMongoSync();
  await imageDownloader();
  await imageFormatter();
};

start()
  .catch(e => console.error(e))
  .then(() => console.timeEnd('fullExecutionTime'));
