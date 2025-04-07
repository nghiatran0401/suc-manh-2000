import React from "react";
import { DESKTOP_WIDTH } from "../constants";
import Carousel from "react-material-ui-carousel";
import { useMediaQuery, useTheme, Box, Grid, Typography } from "@mui/material";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
      <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" color={"red"}>
        Đơn vị đồng hành
      </Typography>

      <div style={{ maxWidth: "100vw", width: "100%", margin: isMobile ? "12px auto" : "24px auto" }}>
        <Grid container spacing={isMobile ? 1 : 2}>
          {COMPANIONS.map((d, idx) => (
            <Grid item xs={12 / 5} sm={12 / COMPANIONS.length} key={idx}>
              <img
                src={d.url}
                alt={d.name}
                style={{
                  width: "100%",
                  height: isMobile ? "70px" : "100px",
                  objectFit: "contain",
                }}
              />
            </Grid>
          ))}
        </Grid>
      </div>
    </Box>
  );
}
