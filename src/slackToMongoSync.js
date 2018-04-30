const { getMongoCollection } = require('./mongo');
const { getProfilesWithImages } = require('./utils');
const slack = require('slack');

const { SLACK_API_TOKEN } = process.env;

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
module.exports = async () => {
  console.time('FullInsertTime');
  return start().then(() => console.timeEnd('FullInsertTime'));
};
