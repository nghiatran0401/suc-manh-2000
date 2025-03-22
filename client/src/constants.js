import logoDonate from "./assets/donate.png";
import logoWorking from "./assets/working.png";
import logoFinish from "./assets/finish.png";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import WcOutlinedIcon from "@mui/icons-material/WcOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import Brightness7OutlinedIcon from "@mui/icons-material/Brightness7Outlined";
import LoopOutlinedIcon from "@mui/icons-material/LoopOutlined";
import BeenhereOutlinedIcon from "@mui/icons-material/BeenhereOutlined";
import BedroomChildOutlinedIcon from "@mui/icons-material/BedroomChildOutlined";
import KitchenOutlinedIcon from "@mui/icons-material/KitchenOutlined";

export const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const POSTS_PER_PAGE = 96;

export const DESKTOP_WIDTH = "1100px";

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
    path: "#",
    title: "Phòng Tin Học Cho Em",
    children: [
      // {
      //   path: "/phong-tin-hoc-2023",
      //   title: "Phòng tin học 2023",
      // },
    ],
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
  "da-hoan-thanh": "Đã hoàn thành",
  "dang-gop-le": "Đang góp lẻ",
  "dang-xay-dung": "Đang xây dựng",
  "can-quyen-gop": "Cần quyên góp",
};

export const statusColorMapping = {
  "can-quyen-gop": "#F5222D",
  "dang-gop-le": "#4d9aed",
  "dang-xay-dung": "#FAAD14",
  "da-hoan-thanh": "#58C27D",
};

export const statusColorHoverMapping = {
  "can-quyen-gop": "rgba(245, 34, 45, 0.8)",
  "dang-gop-le": "rgba(77, 154, 237, 0.8)",
  "dang-xay-dung": "rgba(250, 173, 20, 0.8)",
  "da-hoan-thanh": "rgba(88, 194, 125, 0.8)",
};

export const statusLogoMapping = {
  "can-quyen-gop": logoDonate,
  "dang-gop-le": logoDonate,
  "dang-xay-dung": logoWorking,
  "da-hoan-thanh": logoFinish,
};

export const metadataMapping = {
  stage: "Cấp",
  constructionItems: "Công trình",
  progress: "Tiến độ",
  type: "Hạng mục",
  totalStudents: "Số học sinh huởng lợi",
  totalClassrooms: "Số phòng học",
  totalPublicAffairsRooms: "Số phòng công vụ",
  totalToilets: "Số WC",
  totalRooms: "Số phòng ở",
  totalKitchens: "Số bếp",
  // start_date: "Ngày khởi công",
  // end_date: "Ngày hoàn thành",
};

export const metadataLogoMapping = {
  stage: <Brightness7OutlinedIcon />,
  constructionItems: <ConstructionOutlinedIcon />,
  progress: <LoopOutlinedIcon />,
  type: <BeenhereOutlinedIcon />,
  totalStudents: <PeopleOutlineIcon />,
  totalClassrooms: <HomeOutlinedIcon />,
  totalPublicAffairsRooms: <AccountBalanceOutlinedIcon />,
  totalToilets: <WcOutlinedIcon />,
  totalRooms: <BedroomChildOutlinedIcon />,
  totalKitchens: <KitchenOutlinedIcon />,
  // start_date: <CalendarMonthOutlinedIcon />,
  // end_date: <CalendarMonthOutlinedIcon />,
};

export const constructionUnitMapping = {
  "NE - PGD": "Phòng giáo dục",
  "NE - DTN": "Đoàn thanh niên",
  "NE - QBTTE": "Quỹ bảo trợ trẻ em",
  VVC: "Trung tâm tình nguyên quốc gia",
};

export const publicLogoUrl = "https://web.sucmanh2000.com/static/media/logo-header.98d4636d9bfeb88f95d4.png";

export const COMMON_SEO_DESCRIPTION = "Sức mạnh 2000 – Tiền lẻ mỗi ngày Triệu người chung tay Xây nghìn trường mới";

export const EXCLUDED_FILTER = ["phong-tin-hoc", "wc", "loai-khac", "gieng-nuoc"];
