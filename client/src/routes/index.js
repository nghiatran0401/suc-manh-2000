import Home from "../pages/Home";
import GioiThieu from "../pages/GioiThieu";
import ThongBao from "../pages/ThongBao";
import DuAn2024 from "../pages/DuAn2024";

export const route = [
    {
        path: "/",
        name: "Home",
        component: Home,
    },
    {
        path: "/gioi-thieu",
        name: "Giới Thiệu",
        component: GioiThieu
    },
    {
        path: "/thong-bao",
        name: "Thông báo",
        component: ThongBao,
    },
    {
        path: "/du-an-2024",
        name: "Dự án 2024",
        component: DuAn2024,
    },
]