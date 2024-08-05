import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { DESKTOP_WIDTH } from "../constants";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./config/styles.css";

import SucManh2000 from "../assets/companions/Suc_manh_2000.png";
import TrungTamTinhNguyenQuocGia from "../assets/companions/Trung_tam_tinh_nguyen_quoc_gia.jpeg";
import TinhNguyenNiemTin from "../assets/companions/Tinh_nguyen_niem_tin.jpeg";
import NuoiEm from "../assets/companions/Nuoi_em.png";
import Dentsu from "../assets/companions/Dentsu.png";

const COMPANIONS = [
  {
    name: "Sức mạnh 2000",
    url: SucManh2000,
  },
  {
    name: "Trung tâm tình nguyện quốc gia",
    url: TrungTamTinhNguyenQuocGia,
  },
  {
    name: "Tình nguyện Niềm Tin",
    url: TinhNguyenNiemTin,
  },
  {
    name: "Nuôi em",
    url: NuoiEm,
  },
  {
    name: "Dentsu",
    url: Dentsu,
  },
];

export default function Companion() {
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5,
      slidesToSlide: 5,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 3,
      slidesToSlide: 3,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 2,
      slidesToSlide: 2,
    },
  };

  return (
    <Box
      maxWidth={DESKTOP_WIDTH}
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
        Đơn vị đồng hành
      </Typography>
      <Carousel responsive={responsive} autoPlay infinite autoPlaySpeed={5000} arrows={false}>
        {COMPANIONS.map((d, i) => (
          <img
            src={d.url}
            alt={d.name}
            style={{
              width: "100%",
              height: "100px",
              objectFit: "contain",
            }}
          />
        ))}
      </Carousel>
    </Box>
  );
}
