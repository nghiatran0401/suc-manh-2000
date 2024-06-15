const { removeVietnameseAccents } = require('./string');

const modifyNameForSearch = (name) => {
  const cleanedName = removeVietnameseAccents(name ?? "")
    ?.toLowerCase()
    ?.replace(/[^a-z0-9 ]/g, "");
  return cleanedName;
};



module.exports = {
  modifyNameForSearch,
};
