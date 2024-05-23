export const ProjectCategories = new Array(
  new Date(Date.now()).getFullYear() - 2012
)
  .fill(0)
  .map((_, index) => ({
    label: "Dự án " + (2012 + index),
    value: String(2012 + index),
  })).reverse();
