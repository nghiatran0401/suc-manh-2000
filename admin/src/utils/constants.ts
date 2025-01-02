import {
  LockOutlined,
  MailOutlined,
  AppstoreOutlined,
  ShopOutlined,
  GiftOutlined,
  IdcardOutlined,
  ContactsOutlined,
  CreditCardOutlined,
  BookOutlined,
  ReadOutlined,
  CloudOutlined,
  CodeOutlined,
  DatabaseOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  HourglassOutlined,
  InboxOutlined,
} from "@ant-design/icons";

// @ts-ignore
export const SERVER_URL = import.meta.env.VITE_SERVER_URL;
// @ts-ignore
export const CLIENT_URL = import.meta.env.VITE_CLIENT_URL;

export const POSTS_PER_PAGE = 12;

export const categoryMapping = {
  "thong-bao": "Tiến độ",
  "du-an-2025": "DA 25",
  "du-an-2024": "DA 24",
  "du-an-2023": "DA 23",
  "du-an-2022": "DA 22",
  "du-an-2021": "DA 21",
  "du-an-2020": "DA 20",
  "du-an-2019": "DA 19",
  "du-an-2018": "DA 18",
  "du-an-2017": "DA 17",
  "du-an-2016": "DA 16",
  "du-an-2014-2015": "DA 14-15",
  "du-an-2012": "DA 12",
  "bao-cao-tai-chinh": "BCTC",
  "bao-chi-truyen-hinh": "Truyền thông",
  "cau-chuyen": "Câu chuyện",
  "tai-tro": "Tài trợ",
  // "tien-do-xay-dung": "Tiến độ xây dựng",
  // "gay-quy": "Gây quỹ",
  // "phong-tin-hoc-2023": "PTH-23",
};

export const classificationMapping = {
  "truong-hoc": "Trường học",
  "nha-hanh-phuc": "Nhà hạnh phúc",
  "khu-noi-tru": "Khu nội trú",
  "cau-hanh-phuc": "Cầu đi học",
  wc: "WC",
  "gieng-nuoc": "Giếng nước",
  "loai-khac": "Loại khác",
  "phong-tin-hoc": "Phòng tin học",
};

export const statusMapping = {
  "can-quyen-gop": "Cần quyên góp",
  "dang-xay-dung": "Đang xây dựng",
  "da-hoan-thanh": "Đã hoàn thành",
};

export const icons = [
  LockOutlined,
  MailOutlined,
  AppstoreOutlined,
  ShopOutlined,
  GiftOutlined,
  IdcardOutlined,
  ContactsOutlined,
  CreditCardOutlined,
  BookOutlined,
  ReadOutlined,
  CloudOutlined,
  CodeOutlined,
  DatabaseOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  HourglassOutlined,
  InboxOutlined,
];
