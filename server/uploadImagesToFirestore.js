const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const { admin } = require("./firebase");

const getAllFiles = (dir) => {
  const dirents = fs.readdirSync(dir, { withFileTypes: true }).map((dirent) => ({ dirent, path: path.resolve(dir, dirent.name) }));

  return dirents.reduce((acc, dirent) => {
    if (dirent.dirent.isDirectory()) return [...acc, ...getAllFiles(dirent.path)];
    if (dirent.dirent.isFile()) return [...acc, dirent];
    return acc;
  }, []);
};

const getAllFilesInFolder = (dir) => {
  const regex = new RegExp(`^${_.escapeRegExp(dir)}`);

  return getAllFiles(dir).map((dirent) => {
    let shortPosixPath = dirent.path.replace(regex, "");
    shortPosixPath = shortPosixPath.split(path.sep).join(path.posix.sep);
    if (shortPosixPath.startsWith(path.posix.sep)) shortPosixPath = shortPosixPath.substring(1);

    // Find the index of 'uploads' in the path
    const uploadsIndex = shortPosixPath.indexOf("uploads");

    // If 'uploads' is found in the path, remove the preceding part of the path
    if (uploadsIndex !== -1) {
      shortPosixPath = shortPosixPath.substring(uploadsIndex);
    }

    return { fullPath: dirent.path, shortPosixPath };
  });
};

const uploadImagesToFirestore = async () => {
  const dir = "uploads";
  const files = getAllFilesInFolder(dir);
  const bucket = admin.storage().bucket();

  for (const file of files) {
    if (file.shortPosixPath.includes(".DS_Store")) continue;

    try {
      await bucket.upload(file.shortPosixPath, {
        destination: file.shortPosixPath,
        resumable: false,
      });
      console.log(`Successfully uploaded ${file.shortPosixPath}`);
    } catch (error) {
      console.error(`Failed to upload ${file.shortPosixPath}:`, error.message);
    }
  }
};

uploadImagesToFirestore();
