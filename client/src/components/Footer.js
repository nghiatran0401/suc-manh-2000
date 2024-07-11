import React from "react";
import { useMediaQuery, Box, Grid, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import logo from "../assets/logo-header.png";
import "./config/styles.css";
import { maxWidth } from "@mui/system";

export default function Footer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box bgcolor={"#262626"}>
      <Box display={"flex"} flexDirection={"column"} gap={"24px"} maxWidth={"1080px"} m={"auto"} p={"20px"}>
        <Box display={"flex"} flexDirection={isMobile ? "column" : "row"} gap={"24px"} p={"20px"}>
          <img src={logo} alt="logo" style={{ maxWidth: isMobile ? "60px" : "100px", objectFit: "contain" }} />
          <Typography variant="body1" color={"#E4E4E4"}>
            Dự án Sức Mạnh 2000 - Dự án gây quỹ của Ánh Sáng Núi Rừng điều hành bởi Hoàng Hoa Trung - Forbes Việt Nam 30Under 30 đồng hành bởi Trung tâm Tình Nguyện Quốc Gia.
            <br />
            <br />
            Phát triển bởi đội ngũ điều hành Dự án Nuôi Em, Ánh Sáng Núi Rừng, nhóm Tình nguyện Niềm Tin.
          </Typography>
        </Box>
        <Grid container spacing={3} pb={"20px"}>
          <Grid item xs={6} sm={3}>
            <Typography variant="h7" color={"#E4E4E4"}>
              QUYÊN GÓP
            </Typography>
            <div className="content-footer">
              <Typography>Quét QR Momo</Typography>
              <Typography>Đăng ký bỏ lợn đất</Typography>
              <Typography>Góp 2000đ mỗi ngày</Typography>
              <Typography>Rủ 3 người bạn</Typography>
              <Typography>Gây quỹ</Typography>
            </div>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="h7" color={"#E4E4E4"}>
              TIN TỨC
            </Typography>
            <div className="content-footer">
              <Typography>Tiến độ xây dựng</Typography>
              <Typography>Báo cáo tài chính</Typography>
              <Typography>Báo chí - truyền hình đưa tin</Typography>
              <Typography>Câu chuyện</Typography>
              <Typography>Tài trợ</Typography>
            </div>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="h7" color={"#E4E4E4"}>
              DỰ ÁN
            </Typography>
            <div className="content-footer">
              <Typography>Dự án 2024</Typography>
              <Typography>Dự án 2023</Typography>
              <Typography>Dự án 2022</Typography>
              <Typography>Dự án 2021</Typography>
              <Typography>Dự án 2020 - 2012</Typography>
            </div>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="h7" color={"#E4E4E4"}>
              LIÊN HỆ
            </Typography>
            <div className="content-footer">
              <Typography>P702 - 62 Bà Triệu - TW Đoàn.</Typography>
              <Typography>Điện thoại: 0975 302 307 | 0986 832 256</Typography>
              <Typography sx={{ wordWrap: "break-word" }}>Email: niemtingroup@gmail.com</Typography>{" "}
            </div>
          </Grid>
        </Grid>

        <Box display={"flex"} flexDirection={"row"} alignItems={"center"} justifyContent={"center"} pb={"20px"}>
          <Typography color={"white"}>Copyright 2024 © Phát triển bởi đội ngũ điều hành Ánh Sáng Núi Rừng và Dự án Nuôi Em.</Typography>
        </Box>
      </Box>
    </Box>
  );
}
