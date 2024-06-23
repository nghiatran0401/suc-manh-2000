import React from "react";
import { Typography, Box, Card, CardContent, CardMedia, CardActions } from "@mui/material";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./config/styles.css";
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";

import HoangHoaTrung from "../assets/team/Hoang_Hoa_Trung.jpg";
import NguyenThiHien from "../assets/team/Nguyen_Thi_Hien.jpg";
import LeHoangYen from "../assets/team/Le_Hoang_Yen.jpg";
import TranThuyTrang from "../assets/team/Tran_Thuy_Trang.jpg";
import LyPhuongThao from "../assets/team/Ly_Phuong_Thao.jpg";
import VoThiTuyetMinh from "../assets/team/Vo_Thi_Tuyet_Minh.jpg";
import PhamNgocCham from "../assets/team/Pham_Ngoc_Cham.jpg";
import NguyenThiAnhDao from "../assets/team/Nguyen_Thi_Anh_Dao.jpg";

export const MEMBERS = [
  {
    name: "HOÀNG HOA TRUNG",
    role: "Điều hành dự án",
    description: "Chỉ tốt nghiệp cấp 3. Với 14 năm gắn bó với các HĐXH vùng cao. Forbes 30Under30 Việt Nam - Gương mặt trẻ Việt Nam tiêu biểu.",
    image: HoangHoaTrung,
  },
  {
    name: "NGUYỄN THỊ HIỀN",
    role: "Phó chủ nhiệm dự án sức mạnh 2000",
    description: "12 năm hoạt động công tác xã hội và tình nguyện từ các CLB sinh viên, các tổ chức tại Việt Nam, Thái Lan. Tiến Sỹ Thủy Văn và Môi Trường tại Ý.",
    image: NguyenThiHien,
  },
  {
    name: "LÊ HOÀNG YẾN",
    role: "Phụ trách tiến độ dự án",
    description: "Hơn 4 năm tham gia các HĐXH và đồng thời làm TNV của dự án. Cử nhân ĐH Kinh tế Quốc dân, hiện tại đang làm việc trong lĩnh vực Tài chính - Kế toán.",
    image: LeHoangYen,
  },
  {
    name: "TRẦN THÙY TRANG",
    role: "Vận hành trường, nội trú",
    description: "Nhân sự từ Trung tâm Tình nguyện Quốc Gia, phụ trách đầu mối với địa phương, thẩm định bản vẽ, báo giá nội bộ và vận hành, báo cáo, chứng từ.",
    image: TranThuyTrang,
  },
  {
    name: "LÝ PHƯƠNG THẢO",
    role: "Partnership",
    description: "Một sinh viên năng nổ của Đại Học Thương Mại, sinh viên năm 3 và 2 năm HĐXH.",
    image: LyPhuongThao,
  },
  {
    name: "VÕ THỊ TUYẾT MINH",
    role: "Phụ trách sao kê, góp lẻ",
    description: "",
    image: VoThiTuyetMinh,
  },
  {
    name: "PHẠM NGỌC CHÂM",
    role: "Phụ trách Góp lẻ SM2000 & Nuôi Em Campuchia-Kenya",
    description: "",
    image: PhamNgocCham,
  },
  {
    name: "NGUYỄN THỊ ANH ĐÀO",
    role: "Vận hành dự án Nuôi em 500 thuộc Nhà hạnh phúc",
    description: "Hơn 5 năm hoạt động công tác xã hội, phụ trách cấp và duy trì học bổng cho các em đến năm 18 tuổi.",
    image: NguyenThiAnhDao,
  },
];

export default function CarouselMembers() {
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
      slidesToSlide: 4, // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 2, // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
  };

  return (
    <Box
      maxWidth={"1080px"}
      display={"flex"}
      flexDirection={"column"}
      gap={"24px"}
      m={"64px auto"}
      sx={{
        "@media (max-width: 600px)": {
          m: "16px auto",
          p: "0 16px",
        },
      }}
    >
      <Typography variant="h5" fontWeight="bold" color={"red"}>
        Đội ngũ vận hành SỨC MẠNH 2000
      </Typography>

      <Carousel responsive={responsive} autoPlay infinite autoPlaySpeed={5000}>
        {MEMBERS.map((item, index) => (
          <Card
            key={index}
            className="card-contanier"
            sx={{
              m: "16px",
              "@media (max-width: 600px)": {
                m: 0,
              },
            }}
          >
            <CardMedia component="img" alt={item.caption} height="300" image={item.image} />
            <CardContent sx={{ minHeight: "300px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              {item.name && item.role && (
                <>
                  <Typography align="center" variant="h6" fontWeight={"bold"}>
                    {item.name}
                  </Typography>

                  <Typography align="center" variant="body1" fontWeight={"bold"}>
                    {item.role}
                  </Typography>

                  <CardActions sx={{ display: "flex", justifyContent: "center" }}>
                    <FacebookOutlinedIcon />
                    <EmailOutlinedIcon />
                    <LinkedInIcon />
                    <TwitterIcon />
                  </CardActions>

                  <Typography align="center" variant="body2">
                    {item.description}
                  </Typography>
                </>
              )}

              {item.caption && (
                <Typography align="center" variant="body2">
                  {item.caption}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Carousel>
    </Box>
  );
}
