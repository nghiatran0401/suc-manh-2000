export function truncate(str, num) {
  return str.length > num ? str.slice(0, num) + "..." : str;
}

export function convertToEmbedUrl(url) {
  const videoId = url.split("v=")[1];
  const ampersandPosition = videoId.indexOf("&");
  if (ampersandPosition !== -1) {
    videoId = videoId.substring(0, ampersandPosition);
  }
  return `https://www.youtube.com/embed/${videoId}`;
}
