import donate from "./assets/donate.png";
import working from "./assets/working.png";
import finish from "./assets/finish.png";
import { PeopleOutline, HomeOutlined, WcOutlined, AccountBalanceOutlined, ConstructionOutlined, Brightness7Outlined, LoopOutlined, BeenhereOutlined, BedroomChildOutlined, KitchenOutlined } from "@mui/icons-material";

export const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const POSTS_PER_PAGE = 96;

export const DESKTOP_WIDTH = "1100px";

export const EXCLUDED_FILTER = ["phong-tin-hoc", "wc", "loai-khac", "gieng-nuoc"];

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
    name: "quyen-gop",
    title: "Quyên Góp",
    children: [
      {
        path: "https://goptruongle.sucmanh2000.com/",
        title: "Trường học",
      },
      {
        path: "https://cauhanhphuc.sucmanh2000.com/",
        title: "Cầu dân sinh",
      },
      {
        path: "https://nhahanhphuc.sucmanh2000.com/",
        title: "Nhà hạnh phúc",
      },
    ],
  },
  {
    path: "#",
    name: "tin-tuc",
    title: "Tin Tức",
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
        title: "Báo chí – truyền hình",
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
    title: "Dự án theo năm",
    children: [
      {
        path: "/du-an-2025",
        title: "Dự án 2025",
      },
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
    path: "/tra-cuu-sao-ke",
    title: "Tra cứu sao kê",
    children: [],
  },
];

export const categoryMapping = {
  "thong-bao": "Tiến độ xây dựng",
  "bao-cao-tai-chinh": "Báo cáo tài chính",
  "bao-chi-truyen-hinh": "Báo chí – truyền hình đưa tin",
  "cau-chuyen": "Câu chuyện",
  "tai-tro": "Tài trợ",
  "phong-tin-hoc": "Phòng Tin Học Cho Em",
  "du-an-2025": "Dự án 2025",
  "du-an-2024": "Dự án 2024",
  "du-an-2023": "Dự án 2023",
  "du-an-2022": "Dự án 2022",
  "du-an-2021": "Dự án 2021",
  "du-an-2020": "Dự án 2020",
  "du-an-2019": "Dự án 2019",
  "du-an-2018": "Dự án 2018",
  "du-an-2017": "Dự án 2017",
  "du-an-2016": "Dự án 2016",
  "du-an-2014-2015": "Dự án 2014 - 2015",
  "du-an-2012": "Dự án 2012",
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

export const totalFundMapping = {
  "less-than-100": "Dưới 100 triệu",
  "100-to-200": "100 - 200 triệu",
  "200-to-300": "200 - 300 triệu",
  "300-to-400": "300 - 400 triệu",
  "more-than-400": "Hơn 400 triệu",
};

export const statusMapping = {
  "can-quyen-gop": { name: "Cần quyên góp", bgColor: "#F5222D", bgColorHover: "rgba(245, 34, 45, 0.9)", logo: donate },
  "dang-xay-dung": { name: "Đang xây dựng", bgColor: "#FAAD14", bgColorHover: "rgba(250, 173, 20, 0.9)", logo: working },
  "da-hoan-thanh": { name: "Đã hoàn thành", bgColor: "#58C27D", bgColorHover: "rgba(88, 194, 125, 0.9)", logo: finish },
  "dang-gop-le": { name: "Đang góp lẻ", bgColor: "#4d9aed", bgColorHover: "rgba(77, 154, 237, 0.9)", logo: donate },
};

export const metadataMapping = {
  stage: {
    name: "Cấp",
    logo: <Brightness7Outlined />,
  },
  constructionItems: {
    name: "Công trình",
    logo: <ConstructionOutlined />,
  },
  progress: {
    name: "Tiến độ",
    logo: <LoopOutlined />,
  },
  type: {
    name: "Hạng mục",
    logo: <BeenhereOutlined />,
  },
  totalStudents: {
    name: "Số học sinh huởng lợi",
    logo: <PeopleOutline />,
  },
  totalClassrooms: {
    name: "Số phòng học",
    logo: <HomeOutlined />,
  },
  totalPublicAffairsRooms: {
    name: "Số phòng công vụ",
    logo: <AccountBalanceOutlined />,
  },
  totalToilets: {
    name: "Số WC",
    logo: <WcOutlined />,
  },
  totalRooms: {
    name: "Số phòng ở",
    logo: <BedroomChildOutlined />,
  },
  totalKitchens: {
    name: "Số bếp",
    logo: <KitchenOutlined />,
  },
  // start_date: {
  //   name: "Ngày khởi công",
  //   logo: <CalendarMonthOutlined />,
  // },
  // end_date: {
  //   name: "Ngày hoàn thành",
  //   logo: <CalendarMonthOutlined />,
  // },
};

export const constructionUnitMapping = {
  "NE - PGD": "Phòng giáo dục",
  "NE - DTN": "Đoàn thanh niên",
  "NE - QBTTE": "Quỹ bảo trợ trẻ em",
  VVC: "TT tình nguyên quốc gia",
};
