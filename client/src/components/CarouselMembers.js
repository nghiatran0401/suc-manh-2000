import { Typography, Box } from "@mui/material";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import "./config/styles.css";
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import React from "react";

export const MEMBERS = [
  {
    name: "HOÀNG HOA TRUNG",
    role: "Điều hành dự án",
    description: "Chỉ tốt nghiệp cấp 3. Với 14 năm gắn bó với các HĐXH vùng cao. Forbes 30Under30 Việt Nam - Gương mặt trẻ Việt Nam tiêu biểu.",
    image: "https://firebasestorage.googleapis.com/v0/b/savvy-serenity-424116-g1.appspot.com/o/team%2FHoang_Hoa_Trung.jpg?alt=media&token=9b2cc3db-78a3-4414-b11d-3d49e31f844f",
  },
  {
    name: "NGUYỄN THỊ HIỀN",
    role: "Phó chủ nhiệm dự án sức mạnh 2000",
    description: "12 năm hoạt động công tác xã hội và tình nguyện từ các CLB sinh viên, các tổ chức tại Việt Nam, Thái Lan. Tiến Sỹ Thủy Văn và Môi Trường tại Ý.",
    image: "https://firebasestorage.googleapis.com/v0/b/savvy-serenity-424116-g1.appspot.com/o/team%2FNguyen_Thi_Hien.jpg?alt=media&token=d96488cb-7c3f-4038-9139-c2150bedd8c1",
  },
  {
    name: "LÊ HOÀNG YẾN",
    role: "Phụ trách tiến độ dự án",
    description: "Hơn 4 năm tham gia các HĐXH và đồng thời làm TNV của dự án. Cử nhân ĐH Kinh tế Quốc dân, hiện tại đang làm việc trong lĩnh vực Tài chính - Kế toán.",
    image: "https://firebasestorage.googleapis.com/v0/b/savvy-serenity-424116-g1.appspot.com/o/team%2FLe_Hoang_Yen.jpg?alt=media&token=ad0e6516-f752-4a4d-a5a8-ea9c4af0eb4b",
  },
  {
    name: "TRẦN THÙY TRANG",
    role: "Vận hành trường, nội trú",
    description: "Nhân sự từ Trung tâm Tình nguyện Quốc Gia, phụ trách đầu mối với địa phương, thẩm định bản vẽ, báo giá nội bộ và vận hành, báo cáo, chứng từ.",
    image: "https://firebasestorage.googleapis.com/v0/b/savvy-serenity-424116-g1.appspot.com/o/team%2FTran_Thuy_Trang.jpg?alt=media&token=1dd765b4-9965-413e-b1f7-cbafb667e8c5",
  },
  {
    name: "LÝ PHƯƠNG THẢO",
    role: "Partnership",
    description: "Một sinh viên năng nổ của Đại Học Thương Mại, sinh viên năm 3 và 2 năm HĐXH.",
    image: "https://firebasestorage.googleapis.com/v0/b/savvy-serenity-424116-g1.appspot.com/o/team%2FLy_Phuong_Thao.jpg?alt=media&token=22ac1b4f-deba-49c3-b736-0a592a374313",
  },
  {
    name: "VÕ THỊ TUYẾT MINH",
    role: "Phụ trách sao kê, góp lẻ",
    description: "",
    image: "https://firebasestorage.googleapis.com/v0/b/savvy-serenity-424116-g1.appspot.com/o/team%2FVo_Thi_Tuyet_Minh.jpg?alt=media&token=194535bb-0322-4822-a081-067a81a7d2b6",
  },
  {
    name: "PHẠM NGỌC CHÂM",
    role: "Phụ trách Góp lẻ SM2000 & Nuôi Em Campuchia-Kenya",
    description: "",
    image: "https://firebasestorage.googleapis.com/v0/b/savvy-serenity-424116-g1.appspot.com/o/team%2FPham_Ngoc_Cham.jpg?alt=media&token=a71e96a1-376d-470e-be96-bed9fc53fcf5",
  },
  {
    name: "NGUYỄN THỊ ANH ĐÀO",
    role: "Vận hành dự án Nuôi em 500 thuộc Nhà hạnh phúc",
    description: "Hơn 5 năm hoạt động công tác xã hội, phụ trách cấp và duy trì học bổng cho các em đến năm 18 tuổi. Hiện tại đang là Quản lý Nhân sự của Tập đoàn đa quốc gia tại Việt Nam.",
    image: "https://firebasestorage.googleapis.com/v0/b/savvy-serenity-424116-g1.appspot.com/o/team%2FNguyen_Thi_Anh_Dao.jpg?alt=media&token=b1bccfc0-53d0-4e32-b371-7ec58ecfebd4",
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
    <Box maxWidth={"1080px"} 
    display={"flex"} 
    flexDirection={"column"} 
    gap={"24px"} m={"64px auto"}   
    sx={{
      "@media (max-width: 600px)": {
        m: "20px auto",
        p: "0 10px",
      },
    }}>
      <Typography variant="h5" fontWeight="bold" color={"red"}>
        Đội ngũ vận hành SỨC MẠNH 2000
      </Typography>

      <Carousel responsive={responsive} autoPlay infinite autoPlaySpeed={5000}>
        {MEMBERS.map((item, index) => (
          <Card key={index} className="card-contanier" sx={{ m: "16px" }}>
            <CardMedia component="img" alt={item.caption} height="300" image={item.image} />
            <CardContent sx={{ minHeight: "350px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
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
