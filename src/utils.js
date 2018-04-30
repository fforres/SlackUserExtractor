const arrayOfImageKeys = [
  'image_original',
  'image_512',
  'image_192',
  'image_72',
  'image_48',
  'image_32',
  'image_24',
];
module.exports.arrayOfImageKeys = arrayOfImageKeys;

const getBiggestImage = profile =>
  arrayOfImageKeys.find(key =>
    Object.prototype.hasOwnProperty.call(profile, key));

module.exports.getProfilesWithImages = arrayOfProfiles =>
  arrayOfProfiles.filter((found) => {
    const biggestImageKey = getBiggestImage(found.profile);
    if (!biggestImageKey) {
      return false;
    }
    return found.profile[biggestImageKey].lastIndexOf('gravatar') === -1;
  });
