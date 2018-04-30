const { getMongoCollection } = require('./mongo');
const { getProfilesWithImages, arrayOfImageKeys } = require('./utils');
const { writeFile } = require('fs-extra');
const fetch = require('node-fetch');
const PQueue = require('p-queue');
const mkdirp = require('mkdirp-promise');

const queue = new PQueue({ concurrency: 4 });

const getDatabaseMembers = async () => {
  const collection = await getMongoCollection();
  // const founds = await collection.find().toArray();
  const founds = await collection.find().toArray();
  const filteredFounds = getProfilesWithImages(founds);
  return filteredFounds;
};

const downloadImage = async ({
  imageUrl, id, imageSize, extension,
}) => {
  const data = await fetch(imageUrl);
  const parsedData = await data.buffer();
  const directory = `./src/data/${id}`;
  await mkdirp(directory);
  await writeFile(`${directory}/${imageSize}.${extension}`, parsedData);
};

const enqueueFetchImages = async ({ id, profile }) => {
  Object.keys(profile)
    .filter(el => arrayOfImageKeys.find(imageKey => imageKey === el))
    .forEach((key) => {
      const imageUrl = profile[key];
      if (!imageUrl) {
        return;
      }
      const ob = {
        id,
        imageUrl: profile[key],
        imageSize: key,
        extension: profile[key].split('.').pop(),
      };
      queue.add(() => downloadImage(ob));
    });
};
const start = async () => {
  console.time('getDatabaseMembers');
  const databaseMembers = await getDatabaseMembers();
  console.timeEnd('getDatabaseMembers');
  console.time('enqueueFetchImages');
  databaseMembers.forEach(databaseMember => enqueueFetchImages(databaseMember));
  console.timeEnd('enqueueFetchImages');
  await queue.onIdle();
};

module.exports = async () => {
  console.time('FullDownloadTime');
  return start().then(() => console.timeEnd('FullDownloadTime'));
};
