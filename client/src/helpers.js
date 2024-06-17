export function truncate(str, num) {
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
