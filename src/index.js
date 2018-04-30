require('dotenv').config();
const { MongoClient } = require('mongodb');
const slack = require('slack');

const {
  SLACK_API_TOKEN,
  MONGODB_URL_FULL,
  MONGODB_DATABASE,
  MONGODB_USERS_COLLECTION,
} = process.env;

const getBiggestImage = (profile) => {
  const arrayOfImageKeys = [
    'image_original',
    'image_512',
    'image_192',
    'image_72',
    'image_48',
    'image_32',
    'image_24',
  ];
  return arrayOfImageKeys.find(key =>
    Object.prototype.hasOwnProperty.call(profile, key));
};
const getProfilesWithImages = arrayOfProfiles =>
  arrayOfProfiles.filter((found) => {
    const biggestImageKey = getBiggestImage(found.profile);
    if (!biggestImageKey) {
      return false;
    }
    return found.profile[biggestImageKey].lastIndexOf('gravatar') === -1;
  });
const getMongoCollection = async () => {
  const client = await MongoClient.connect(MONGODB_URL_FULL);
  const db = client.db(MONGODB_DATABASE);
  const col = db.collection(MONGODB_USERS_COLLECTION);
  return col;
};

const getSlackMembers = async () => {
  const { members } = await slack.users.list({ token: SLACK_API_TOKEN });
  const filteredMembers = getProfilesWithImages(members);
  return filteredMembers;
};

const getDatabaseMembers = async () => {
  const collection = await getMongoCollection();
  const founds = await collection.find().toArray();
  const filteredFounds = getProfilesWithImages(founds);
  return filteredFounds;
};

const insertSlackMembers = async (slackMembersToInsert) => {
  if (slackMembersToInsert.length) {
    const collection = await getMongoCollection();
    const inserts = await collection.insertMany(slackMembersToInsert);
    return inserts;
  }
  return null;
};

const getSlackMembersToAdd = (slackMembers, databaseMembers) => {
  const databaseMembersObject = {};
  databaseMembers.forEach((element) => {
    databaseMembersObject[element.id] = true;
  });
  return slackMembers.filter(el => !databaseMembersObject[el.id]);
};
const start = async () => {
  console.time('getSlackMembers');
  const slackMembers = await getSlackMembers();
  console.timeEnd('getSlackMembers');
  console.time('getDatabaseMembers');
  const databaseMembers = await getDatabaseMembers();
  console.timeEnd('getDatabaseMembers');
  console.time('getSlackMembersToAdd');
  const slackMembersNotInDatabase = getSlackMembersToAdd(
    slackMembers,
    databaseMembers,
  );
  console.timeEnd('getSlackMembersToAdd');
  console.time('insertSlackMembers');
  await insertSlackMembers(slackMembersNotInDatabase);
  console.timeEnd('insertSlackMembers');
};
console.time('FullInsertTime');
start()
  .catch(e => console.error(e))
  .then(() => {
    console.timeEnd('FullInsertTime');
  });
