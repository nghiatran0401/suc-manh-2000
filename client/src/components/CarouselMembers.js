import React from "react";
import { Typography, Box, Card, CardContent, CardMedia, Grid } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./config/styles.css";

import HoangHoaTrung from "../assets/team/Hoang_Hoa_Trung.png";
import DoThiKimHoa from "../assets/team/Do_Thi_Kim_Hoa.png";
import HungVo from "../assets/team/Hung_Vo.png";
import HungVu from "../assets/team/Hung_Vu.png";
import NguyenThiHien from "../assets/team/Nguyen_Thi_Hien.png";
import LeHoangYen from "../assets/team/Le_Hoang_Yen.png";
import TranThuyTrang from "../assets/team/Tran_Thuy_Trang.png";
import LyPhuongThao from "../assets/team/Ly_Phuong_Thao.png";
import VoThiTuyetMinh from "../assets/team/Vo_Thi_Tuyet_Minh.png";
import PhamNgocCham from "../assets/team/Pham_Ngoc_Cham.png";
import NguyenThiAnhDao from "../assets/team/Nguyen_Thi_Anh_Dao.png";
import TranHuuNghia from "../assets/team/Tran_Huu_Nghia.png";
import { DESKTOP_WIDTH } from "../constants";

export const MEMBERS = [
  {
    name: "HOÀNG HOA TRUNG",
    role: "Sáng Lập Dự Án Sức Mạnh 2000 và Hệ Sinh Thái Nuôi Em",
    description: `
      <ul style="margin-left: -24px;">
        <li>Forbes 30 Under 30 Việt Nam 2020</li>
        <li>Gương mặt trẻ tiêu biểu Việt Nam</li>
        <li>Phó ban Mạng lưới tình nguyện quốc gia khu vực miền Bắc</li>
        <li>Trưởng nhóm tình nguyện Niềm tin</li>
      </ul>`,
    image: HoangHoaTrung,
  },
  {
    name: "ĐỖ THỊ KIM HOA",
    role: "Giám Đốc Trung Tâm Tình Nguyện Quốc Gia",
    description: `
      <ul style="margin-left: -24px;">
        <li>7+ năm công tác tại Dự án “Tăng cường năng lực hoạt động tình nguyện vì sự phát triển ở Việt Nam” - Liên Hợp Quốc</li>
        <li>9+ năm điều hành Trung tâm Tình nguyện Quốc gia</li>
      </ul>`,
    image: DoThiKimHoa,
  },
  {
    name: "HÙNG VÕ",
    role: "Cố Vấn Chiến Lược & Truyền Thông - Nhà Tài Trợ Thiên Thần",
    description: `
      <ul style="margin-left: -24px;">
        <li>Phó Tổng Marketing Biti's</li>
        <li>Tổng Giám Đốc điều hành Dentsu Redder</li>
        <li>Thành Viên Sáng lập Hội Đồng Cố Vấn - ĐH Fulbright Việt Nam</li>
      </ul>`,
    image: HungVo,
  },
  {
    name: "HÙNG VŨ",
    role: "Cố Vấn Tài Chính - Nhà Tài Trợ Thiên Thần tiêu biểu",
    description: "Công ty Ocean Brand",
    image: HungVu,
  },

  {
    name: "NGUYỄN THỊ HIỀN",
    role: "Phó Chủ Nhiệm Dự Án",
    description: `
      <ul style="margin-left: -24px;">
        <li>12+ năm hoạt động CTXH và tình nguyện từ các CLB sinh viên, tổ chức tại Việt Nam & Thái Lan</li> 
        <li>Tiến Sỹ Thủy Văn và Môi Trường tại Ý</li>
      </ul>`,
    image: NguyenThiHien,
  },
  {
    name: "LÊ HOÀNG YẾN",
    role: "Phụ Trách Tiến Độ",
    description: `
      <ul style="margin-left: -24px;">
        <li>4+ năm hoạt động CTXH và đồng thời làm TNV của dự án</li>
        <li>Hiện tại đang làm việc trong lĩnh vực Tài chính - Kế toán</li>
      </ul>`,
    image: LeHoangYen,
  },
  {
    name: "VÕ THỊ TUYẾT MINH",
    role: "Phụ Trách Sao Kê và Góp Lẻ",
    description: `
      <ul style="margin-left: -24px;">
        <li>2+ năm hoạt động CTXH và đồng thời làm TNV của dự án</li>
        <li>Cử nhân tài chính kế toán</li>
      </ul>
    `,
    image: VoThiTuyetMinh,
  },
  {
    name: "PHẠM NGỌC CHÂM",
    role: "Phụ Trách Góp Lẻ Sức Mạnh 2000 và Nuôi Em Campuchia - Kenya",
    description: `
      <ul style="margin-left: -24px;">
        <li>2+ năm hoạt động CTXH và đồng thời làm TNV của dự án</li>
      </ul>
    `,
    image: PhamNgocCham,
  },
  {
    name: "TRẦN THÙY TRANG",
    role: "Vận Hành Trường và Khu Nội Trú",
    description: `
      <ul style="margin-left: -24px;">
        <li>Nhân sự từ Trung tâm Tình Nguyện Quốc Gia</li>
        <li>Phụ trách đầu mối với địa phương, thẩm định bản vẽ, báo giá nội bộ và báo cáo, chứng từ</li>
      </ul>
    `,
    image: TranThuyTrang,
  },
  {
    name: "LÝ PHƯƠNG THẢO",
    role: "Partnership",
    description: `
      <ul style="margin-left: -24px;">
        <li>2+ năm hoạt động CTXH và đồng thời làm TNV của dự án</li>
        <li>Sinh viên năm 3 - Đại Học Thương Mại</li>
      </ul>
    `,
    image: LyPhuongThao,
  },
  {
    name: "NGUYỄN THỊ ANH ĐÀO",
    role: "Vận Hành Dự án Nuôi Em 500 thuộc Nhà Hạnh Phúc",
    description: `
      <ul style="margin-left: -24px;">
        <li>5+ năm hoạt động CTXH và đồng thời làm TNV của dự án</li>
        <li>Phụ trách cấp và duy trì học bổng cho các em đến năm 18 tuổi</li>
      </ul>`,
    image: NguyenThiAnhDao,
  },
  {
    name: "TRẦN HỮU NGHĨA",
    role: "Phụ Trách Kĩ Thuật Web",
    description: `
      <ul style="margin-left: -24px;">
        <li>1+ năm hoạt động CTXH và đồng thời làm TNV của dự án</li>
        <li>Hiện đang là Software Engineer cho công ty Startup tại Singapore<Eli>
      </ul>`,
    image: TranHuuNghia,
  },
];

export default function CarouselMembers() {
  const settings = {
    autoplay: true,
    dots: true,
    autoplaySpeed: 4000,
    speed: 2000,
    rows: 1,
    responsive: [
      {
        breakpoint: 3000,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 464,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
    ],
  };

  return (
    <Box maxWidth={DESKTOP_WIDTH} display={"flex"} flexDirection={"column"} gap={"16px"} m={"16px auto"}>
      <Typography variant="h5" fontWeight="bold" color={"red"} m={"0 16px"}>
        Đội ngũ vận hành
      </Typography>

      <div style={{ maxWidth: "100vw", width: "100%", margin: "0 auto", overflow: "hidden" }}>
        <Slider {...settings}>
          {MEMBERS.map((item, index) => (
            <Grid key={index}>
              <Card className="card-contanier" sx={{ margin: "10px" }}>
                <CardMedia component="img" alt={item.caption} height="300" image={item.image} style={{ objectFit: "fit", objectPosition: "top" }} />
                <CardContent
                  sx={{
                    minHeight: "300px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {item.name && item.role && (
                    <>
                      <Typography align="center" variant="h6" fontWeight={"bold"}>
                        {item.name}
                      </Typography>

                      <Typography align="center" variant="body2" fontWeight={"bold"}>
                        {item.role}
                      </Typography>

                      <Typography align="left" variant="body2" dangerouslySetInnerHTML={{ __html: item.description }} />
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Slider>
      </div>
    </Box>
  );
}
