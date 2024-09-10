import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { DESKTOP_WIDTH } from "../constants";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./config/styles.css";

import SM2000 from "../assets/companions/SM2000.svg";
import VVC from "../assets/companions/VVC.svg";
import TinhNguyenNiemTin from "../assets/companions/Tinh_nguyen_niem_tin.svg";
import NuoiEm from "../assets/companions/Nuoi_em.svg";
import Dentsu from "../assets/companions/Dentsu.svg";

const COMPANIONS = [
  {
    name: "Sức mạnh 2000",
    url: SM2000,
  },
  {
    name: "Trung tâm tình nguyện quốc gia",
    url: VVC,
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
  const settings = {
    autoplay: true,
    // dots: true,
    autoplaySpeed: 4000,
    speed: 2000,
    rows: 1,
    responsive: [
      {
        breakpoint: 3000,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 5,
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
    <Box
      maxWidth={DESKTOP_WIDTH}
      display={"flex"}
      flexDirection={"column"}
      gap={"16px"}
      m={"16px auto"}
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

      <div style={{ maxWidth: "100vw", width: "100%", margin: "0 auto", overflow: "hidden" }}>
        <Slider {...settings}>
          {COMPANIONS.map((d, index) => (
            <Grid key={index} m={"24px auto"}>
              <img
                src={d.url}
                alt={d.name}
                style={{
                  width: "100%",
                  height: "100px",
                  objectFit: "contain",
                }}
              />
            </Grid>
          ))}
        </Slider>
      </div>
    </Box>
  );
}
