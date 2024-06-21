import React from "react";
import { Box, Grid, Typography } from "@mui/material";

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
        Đơn vị đồng hành
      </Typography>

      <Grid container display={"flex"} gap={5} flexWrap="nowrap" alignItems={"center"} justifyContent={"space-between"}>
        {COMPANIONS.map((d, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <img
              src={d.url}
              alt=""
              style={{
                width: "100%",
                height: "100px",
                objectFit: "contain",
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
