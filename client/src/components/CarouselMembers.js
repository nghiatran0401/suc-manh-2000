import React from "react";
import Carousel from "react-material-ui-carousel";
import "./config/styles.css";
import { useMediaQuery, useTheme, Grid, Card, CardMedia, CardContent, Typography, Box } from "@mui/material";

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
import DoVanLam from "../assets/team/Do_Van_Lam.png";
import { DESKTOP_WIDTH } from "../constants";

export const MEMBERS = [
  {
    name: "HOÀNG HOA TRUNG",
    role: "Sáng Lập Dự Án Sức Mạnh 2000 và Hệ Sinh Thái Nuôi Em",
    description: `
      <ul style="margin-left: -24px;">
        <li>Forbes 30 Under 30 Việt Nam 2020</li>
        <li>Gương mặt trẻ tiêu biểu Việt Nam</li>
        <li>Trưởng nhóm tình nguyện Niềm tin</li>
      </ul>`,
    image: HoangHoaTrung,
  },
  {
    name: "ĐỖ THỊ KIM HOA",
    role: "Giám Đốc Trung Tâm Tình Nguyện Quốc Gia",
    description: `
      <ul style="margin-left: -24px;">
        <li>Điều hành Trung tâm Tình nguyện Quốc gia</li>
        <li>Công tác tại Dự án “Tăng cường năng lực hoạt động tình nguyện vì sự phát triển ở Việt Nam”</li>
      </ul>`,
    image: DoThiKimHoa,
  },
  {
    name: "HÙNG VÕ",
    role: "Cố Vấn Chiến Lược & Truyền Thông - Nhà Tài Trợ Thiên Thần",
    description: `
      <ul style="margin-left: -24px;">
        <li>Phó TGĐ Marketing Biti's</li>
        <li>TGĐ điều hành Dentsu Redder</li>
        <li>Thành Viên Sáng lập HĐ Cố Vấn - Fulbright VN</li>
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
    role: "Phó Chủ Nhiệm Dự Án <br/> Phụ trách team Partnership",
    description: `
      <ul style="margin-left: -24px;">
        <li>12+ năm hoạt động CTXH và tình nguyện từ các CLB sinh viên, tổ chức tại Việt Nam & Thái Lan</li> 
        <li>Tiến Sỹ Thủy Văn và Môi Trường tại Ý</li>
      </ul>`,
    image: NguyenThiHien,
  },
  {
    name: "PHẠM NGỌC CHÂM",
    role: "Phụ trách team Góp lẻ và <br/> Nuôi Em Campuchia & Kenya",
    description: `
      <ul style="margin-left: -24px;">
        <li>5+ năm hoạt động CTXH và đồng thời làm TNV của dự án</li>
      </ul>
    `,
    image: PhamNgocCham,
  },
  {
    name: "LÊ HOÀNG YẾN",
    role: "Phụ trách team Tiến độ",
    description: `
      <ul style="margin-left: -24px;">
        <li>5+ năm hoạt động CTXH và đồng thời làm TNV của dự án</li>
        <li>Hiện tại đang làm việc trong lĩnh vực Tài chính - Kế toán</li>
      </ul>`,
    image: LeHoangYen,
  },
  {
    name: "VÕ THỊ TUYẾT MINH",
    role: "Phụ trách team Sao kê",
    description: `
      <ul style="margin-left: -24px;">
        <li>2+ năm hoạt động CTXH và đồng thời làm TNV của dự án</li>
        <li>Cử nhân Tài chính - Kế toán</li>
      </ul>
    `,
    image: VoThiTuyetMinh,
  },
  {
    name: "ĐỖ VĂN LÂM",
    role: "Phụ trách team Thiết kế",
    description: `
      <ul style="margin-left: -24px;">
        <li>3+ năm hoạt động CTXH và đồng thời làm TNV của dự án</li>
        <li>Founder Pha chế dễ òm</li>
        <li>Giám đốc khu vực công ty TNHH Minh Đức</li>
      </ul>`,
    image: DoVanLam,
  },
  {
    name: "NGUYỄN THỊ ANH ĐÀO",
    role: "Phụ trách team Nuôi em 500",
    description: `
      <ul style="margin-left: -24px;">
        <li>5+ năm hoạt động CTXH và đồng thời làm TNV của dự án</li>
        <li>Phụ trách cấp và duy trì học bổng cho các em đến năm 18 tuổi</li>
      </ul>`,
    image: NguyenThiAnhDao,
  },
  {
    name: "LÝ PHƯƠNG THẢO",
    role: "Partnership",
    description: `
      <ul style="margin-left: -24px;">
        <li>5+ năm hoạt động CTXH và đồng thời làm TNV của dự án</li>
      </ul>
    `,
    image: LyPhuongThao,
  },
  {
    name: "TRẦN THÙY TRANG",
    role: "Vận Hành Trường và Khu Nội Trú",
    description: `
      <ul style="margin-left: -24px;">
        <li>Nhân sự từ Trung tâm Tình Nguyện Quốc Gia (VVC)</li>
        <li>Phụ trách đầu mối với địa phương, thẩm định bản vẽ, báo giá nội bộ và báo cáo, chứng từ</li>
      </ul>
    `,
    image: TranThuyTrang,
  },
  {
    name: "TRẦN HỮU NGHĨA",
    role: "Phụ trách Kĩ thuật web",
    description: `
      <ul style="margin-left: -24px;">
        <li>1+ năm hoạt động CTXH và đồng thời làm TNV của dự án</li>
        <li>Hiện tại đang làm việc trong lĩnh vực Công nghệ</li>
      </ul>`,
    image: TranHuuNghia,
  },
];

export default function CarouselMembers() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Determine the number of items per slide based on screen size
  const itemsPerSlide = isMobile ? 1 : 4;

  // Split items into chunks based on the number of items per slide
  const chunkedItems = [];
  for (let i = 0; i < MEMBERS.length; i += itemsPerSlide) {
    chunkedItems.push(MEMBERS.slice(i, i + itemsPerSlide));
  }

  return (
    <Box
      maxWidth={DESKTOP_WIDTH}
      display={"flex"}
      flexDirection={"column"}
      gap={"16px"}
      m={"0 auto"}
      sx={{
        "@media (max-width: 600px)": {
          m: "16px auto",
          p: "0 16px",
        },
      }}
    >
      <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" color={"red"}>
        Đội ngũ vận hành
      </Typography>

      <div style={{ maxWidth: "100vw", width: "100%", margin: "0 auto", overflow: "hidden" }}>
        <Carousel
          indicators={!isMobile}
          indicatorContainerProps={{
            style: {
              margin: "20px",
            },
          }}
          indicatorIconButtonProps={{
            style: {
              margin: "0 5px",
              backgroundColor: "#bdbdbd",
              borderRadius: "20px",
              transform: "none",
              position: "relative",
              padding: 0,
            },
          }}
          activeIndicatorIconButtonProps={{
            style: {
              backgroundColor: "red",
            },
          }}
          IndicatorIcon={<div style={{ width: "30px", height: "5px" }}></div>}
        >
          {chunkedItems.map((chunk, index) => (
            <Grid container spacing={0.25} key={index}>
              {chunk.map((item, idx) => (
                <Grid item xs={12} sm={3} key={idx}>
                  <Card className="card-container" sx={{ my: "10px", mx: "8px", borderRadius: "8px" }}>
                    <CardMedia component="img" alt={item.caption} height="250" image={item.image} style={{ objectFit: "fit", objectPosition: "top" }} />
                    <CardContent
                      sx={{
                        minHeight: "220px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px",
                      }}
                    >
                      {item.name && item.role && (
                        <>
                          <Typography align="center" variant="subtitle1" fontWeight={"bold"}>
                            {item.name}
                          </Typography>

                          <Typography align="center" variant="body2" fontWeight={"bold"} color="red" sx={{ fontSize: "0.9rem" }} dangerouslySetInnerHTML={{ __html: item.role }} />

                          <Typography align="left" variant="body2" sx={{ fontSize: "0.8rem" }} dangerouslySetInnerHTML={{ __html: item.description }} />
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ))}
        </Carousel>
      </div>
    </Box>
  );
}
