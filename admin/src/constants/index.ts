export const SERVER_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

export const POSTS_PER_PAGE = 12;

export const ProjectCategories = new Array(new Date(Date.now()).getFullYear() - 2012)
  .fill(0)
  .map((_, index) => ({
    label: "Dự án " + (2012 + index),
    value: String(2012 + index),
  }))
  .reverse();

export const categoryMapping = {
  "du-an-2024": "Dự án 2024",
  "du-an-2023": "Dự án 2023",
  "du-an-2022": "Dự án 2022",
  "du-an-2021": "Dự án 2021",
  "du-an-2020": "Dự án 2020",
  "du-an-2019": "Dự án 2019",
  "du-an-2018": "Dự án 2018",
  "du-an-2017": "Dự án 2017",
  "du-an-2016": "Dự án 2016",
  "du-an-2024-2015": "Dự án 2014 - 2015",
  "du-an-2012": "Dự án 2012",
};

export const classificationMapping = {
  "truong-hoc": "Trường học",
  "nha-hanh-phuc": "Nhà hạnh phúc",
  "khu-noi-tru": "Khu nội trú",
  "cau-hanh-phuc": "Cầu hạnh phúc",
  wc: "WC",
  "loai-khac": "Loại khác",
};
