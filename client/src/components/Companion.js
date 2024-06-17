import { Box, Grid, Typography } from "@mui/material";
import React from "react";

const COMPANIONS = [
  {
    name: "Sức mạnh 2000",
    url: "https://firebasestorage.googleapis.com/v0/b/savvy-serenity-424116-g1.appspot.com/o/companions%2FSuc_manh_2000.png?alt=media&token=b3f38230-0295-4165-ba55-64f7f035c4e5",
  },
  {
    name: "Trung tâm tình nguyện quốc gia",
    url: "https://firebasestorage.googleapis.com/v0/b/savvy-serenity-424116-g1.appspot.com/o/companions%2FTrung_tam_tinh_nguyen_quoc_gia.jpeg?alt=media&token=ac1b680e-8a33-430b-92f9-bf2069d5a02c",
  },
  {
    name: "Tình nguyện Niềm Tin",
    url: "https://firebasestorage.googleapis.com/v0/b/savvy-serenity-424116-g1.appspot.com/o/companions%2FTinh_nguyen_niem_tin.jpeg?alt=media&token=c588e235-2403-4e52-94f9-11184c4b01bb",
  },
  {
    name: "Nuôi em",
    url: "https://firebasestorage.googleapis.com/v0/b/savvy-serenity-424116-g1.appspot.com/o/companions%2FNuoi_em.png?alt=media&token=ca609971-fcf5-4a54-b392-75b551f8ce83",
  },
  {
    name: "Dentsu",
    url: "https://firebasestorage.googleapis.com/v0/b/savvy-serenity-424116-g1.appspot.com/o/companions%2FDentsu.png?alt=media&token=c50605de-d778-4c18-93eb-69b35139f4a4",
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
