const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const { bucket } = require("../firebase");

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
  const dir = "server/uploads";
  const files = getAllFilesInFolder(dir);
  let startUploading = false;

  for (const file of files) {
    if (file.shortPosixPath.includes(".DS_Store")) continue;

    // Skip files until the specified file is found
    if (!startUploading) {
      if (file.shortPosixPath === "uploads/2023/06/z4382789180768_c56396495537a223c9a5c841d0ec22b8-150x150.jpg") {
        startUploading = true;
        console.log("Lets goo!");
      } else {
        continue;
      }
    }

    try {
      await bucket.upload(file.fullPath, {
        destination: file.shortPosixPath,
        resumable: false,
      });
      console.log(`[Succeeded] ${file.shortPosixPath}`);
    } catch (error) {
      console.error(`[Failed] ${file.shortPosixPath}:`, error.message);
      return;
    }
  }
};

uploadImagesToFirestore();
