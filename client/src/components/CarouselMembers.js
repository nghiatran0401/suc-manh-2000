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
    name: "NGUYỄN THỊ HIỀN",
    role: "Phó chủ nhiệm dự án sức mạnh 2000",
    description: "12 năm hoạt động công tác xã hội và tình nguyện từ các CLB sinh viên, các tổ chức tại Việt Nam, Thái Lan. Tiến Sỹ Thủy Văn và Môi Trường tại Ý.",
    image: "https://th.bing.com/th/id/OIP.ZZf5ANaOGgdbBM-ot_12FgHaHa?w=212&h=212&c=7&r=0&o=5&pid=1.7",
  },
  {
    name: "LÊ HOÀNG YẾN",
    role: "Phụ trách tiến độ dự án",
    description: "Hơn 4 năm tham gia các HĐXH và đồng thời làm TNV của dự án. Cử nhân ĐH Kinh tế Quốc dân, hiện tại đang làm việc trong lĩnh vực Tài chính - Kế toán.",
    image: "https://th.bing.com/th/id/OIP.ZZf5ANaOGgdbBM-ot_12FgHaHa?w=212&h=212&c=7&r=0&o=5&pid=1.7",
  },
  {
    name: "TRẦN THÙY TRANG",
    role: "Vận hành trường, nội trú",
    description: "Nhân sự từ Trung tâm Tình nguyện Quốc Gia, phụ trách đầu mối với địa phương, thẩm định bản vẽ, báo giá nội bộ và vận hành, báo cáo, chứng từ.",
    image: "https://th.bing.com/th/id/OIP.ZZf5ANaOGgdbBM-ot_12FgHaHa?w=212&h=212&c=7&r=0&o=5&pid=1.7",
  },
  {
    name: "VÕ THỊ TUYẾT MINH",
    role: "Phụ trách sao kê, góp lẻ",
    description: "Cử nhân tài chính kế toán.",
    image: "https://th.bing.com/th/id/OIP.ZZf5ANaOGgdbBM-ot_12FgHaHa?w=212&h=212&c=7&r=0&o=5&pid=1.7",
  },
];

export default function CarouselMembers({ title, items }) {
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
    <Box maxWidth={"1080px"} display={"flex"} flexDirection={"column"} gap={"24px"} m={"100px auto"}>
      <Typography variant="h5" fontWeight="bold" color={"red"}>
        Đội ngũ vận hành SỨC MẠNH 2000
      </Typography>

      <Carousel itemClass="carousel-item-padding" responsive={responsive} autoPlay infinite autoPlaySpeed={5000}>
        {MEMBERS.map((item, index) => (
          <Card key={index} className="card-contanier" sx={{ m: "16px" }}>
            <CardMedia component="img" alt={item.caption} height="300" image={item.image} />
            <CardContent sx={{ minHeight: "250px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              {item.role && (
                <CardActions sx={{ display: "flex", justifyContent: "center" }}>
                  <FacebookOutlinedIcon />
                  <EmailOutlinedIcon />
                  <LinkedInIcon />
                  <TwitterIcon />
                </CardActions>
              )}

              {item.role && (
                <Typography align="center" variant="h6" fontWeight={"bold"} lineHeight={1.3}>
                  {item.role}
                </Typography>
              )}

              {item.description && (
                <Typography align="center" variant="body2">
                  {item.description}
                </Typography>
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
