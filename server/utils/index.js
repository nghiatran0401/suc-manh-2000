function convertToDate(prop) {
  if (prop) {
    return prop.toDate();
  }
}

module.exports = { convertToDate };