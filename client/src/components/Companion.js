import { Box, Grid, Typography } from "@mui/material";
import React from "react";

export default function Companion() {
  const data = [
    {
      url: "https://web.sucmanh2000.com/wp-content/uploads/2023/01/Logo-sucmanh2000.png",
    },
    {
      url: "https://web.sucmanh2000.com/wp-content/uploads/2020/04/logo-vvc-final.png",
    },
    {
      url: "https://web.sucmanh2000.com/wp-content/uploads/2020/04/logo-niem-tin.png",
    },
    {
      url: "https://web.sucmanh2000.com/wp-content/uploads/2020/04/cropped-logo-asnr-Copy.png",
    },
    {
      url: "https://web.sucmanh2000.com/wp-content/uploads/2023/02/dentsu.png",
    },
  ];

  return (
    <Box display={"flex"} flexDirection={"column"} gap={"24px"} m={"40px 0"}>
      <Typography variant="h5" fontWeight="bold" color={"red"}>
        Đơn vị đồng hành
      </Typography>

      <Grid display={"flex"} gap={5} flexWrap="nowrap" alignItems={"center"} justifyContent={"space-between"}>
        {data.map((d, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <img src={d.url} alt style={{ width: "100%", height: "100px", objectFit: "contain" }} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
