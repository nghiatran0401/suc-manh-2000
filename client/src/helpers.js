export function truncateCharacters(str, num) {
  return str.length > num ? str.slice(0, num) + "..." : str;
}

export function convertToYoutubeUrl(url) {
  const videoId = url.split("v=")[1];
  const ampersandPosition = videoId.indexOf("&");
  if (ampersandPosition !== -1) {
    videoId = videoId.substring(0, ampersandPosition);
  }
  return `https://www.youtube.com/embed/${videoId}`;
}

export function findTitle(list, title) {
  for (let item of list) {
    if (item.path === title) {
      return item.title;
    }

    if (item.children && item.children.length > 0) {
      let found = findTitle(item.children, title);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

export const standardizeString = (str) => {
  return str
    .split(" ")
    .map((word, index, arr) => {
      if (word.includes("DA")) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ")
    .replace(/,/g, " -");
};
