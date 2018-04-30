const PQueue = require('p-queue');
const glob = require('glob-promise');
const sharp = require('sharp');

const queue = new PQueue({ concurrency: 4 });

const enqueueTransformImages = async ({ filePath, newFilePath }) => {
  queue.add(() => sharp(filePath).toFile(newFilePath));
};

const getFilesToTransform = async () => {
  const files = await glob('./src/data/**/*.*');
  return files.map((filePath) => {
    const fileSplit = filePath.split('/');
    const id = fileSplit[fileSplit.length - 2];
    const filename = filePath.split('.');
    return {
      filePath,
      id,
      newFilePath: `${filename[0]}.webp`,
    };
  });
};

const start = async () => {
  console.time('getFilesToTransform');
  const filesToTransform = await getFilesToTransform();
  console.timeEnd('getFilesToTransform');
  console.time('enqueueTransformImages');
  filesToTransform.forEach(enqueueTransformImages);
  console.timeEnd('enqueueTransformImages');
  await queue.onIdle();
};

module.exports = async () => {
  console.time('fullTransformTime');
  return start().then(() => console.timeEnd('fullTransformTime'));
};
