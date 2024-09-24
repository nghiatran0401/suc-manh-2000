export const capitalizeEachWord = (str: any) => {
  return str
    .split(" ")
    .map((word: any, index: any, arr: any) => {
      if (word.includes("DA")) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};
