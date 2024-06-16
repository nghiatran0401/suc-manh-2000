export const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const POSTS_PER_PAGE = 12;

export const HEADER_DROPDOWN_LIST = [
  {
    path: "/",
    title: "Home",
    children: [],
  },
  {
    path: "/gioi-thieu",
    title: "Giới Thiệu",
    children: [],
  },
  {
    path: "#",
    title: "Quyên Góp",
    children: [
      {
        path: "#",
        title: "Quét QR code MoMo",
      },
      {
        path: "#",
        title: "Đăng ký bỏ lợn đất",
      },
      {
        path: "#",
        title: "Góp 2000 MỖI NGÀY",
      },
      {
        path: "#",
        title: "Rủ 3 người bạn",
      },
      {
        path: "#",
        title: "Gây quỹ",
      },
    ],
  },
  {
    path: "#",
    name: "tin-tuc",
    title: "Tin Sức mạnh 2000",
    children: [
      // {
      //   path: "/thong-bao",
      //   title: "Thông báo Sức Mạnh 2000",
      // },
      {
        path: "/thong-bao",
        title: "Tiến độ xây dựng",
      },
      {
        path: "/bao-cao-tai-chinh",
        title: "Báo cáo tài chính",
      },
      {
        path: "/bao-chi-truyen-hinh",
        title: "Báo chí – truyền hình đưa tin",
      },
      {
        path: "/cau-chuyen",
        title: "Câu chuyện",
      },
      // {
      //   path: "#",
      //   title: "Gây quỹ",
      // },
      {
        path: "/tai-tro",
        title: "Tài trợ",
      },
    ],
  },
  {
    path: "#",
    name: "du-an",
    title: "Xem Dự án theo năm",
    children: [
      {
        path: "/du-an-2024",
        title: "Dự án 2024",
      },
      {
        path: "/du-an-2023",
        title: "Dự án 2023",
      },
      {
        path: "/du-an-2022",
        title: "Dự án 2022",
      },
      {
        path: "/du-an-2021",
        title: "Dự án 2021",
      },
      {
        path: "/du-an-2020",
        title: "Dự án 2020",
      },
      {
        path: "/du-an-2019",
        title: "Dự án 2019",
      },
      {
        path: "/du-an-2018",
        title: "Dự án 2018",
      },
      {
        path: "/du-an-2017",
        title: "Dự án 2017",
      },
      {
        path: "/du-an-2016",
        title: "Dự án 2016",
      },
      {
        path: "/du-an-2014-2015",
        title: "Dự án 2014 - 2015",
      },
      {
        path: "/du-an-2012",
        title: "Dự án 2012",
      },
    ],
  },
  {
    path: "#",
    title: "Phòng Tin Học Cho Em",
    children: [
      {
        path: "/phong-tin-hoc-2023",
        title: "Phòng tin học 2023",
      },
    ],
  },
];

export const classificationMapping = {
  "truong-hoc": "Trường học",
  "nha-hanh-phuc": "Nhà hạnh phúc",
  "khu-noi-tru": "Khu nội trú",
  "cau-hanh-phuc": "Cầu hạnh phúc",
  wc: "WC",
  "loai-khac": "Loại khác",
};

export const statusMapping = {
  "can-quyen-gop": "Cần quyên góp",
  "dang-xay-dung": "Đang xây dựng",
  "da-hoan-thanh": "Đã hoàn thành",
};
