import React from "react";
import { useMediaQuery, Box, Grid, Typography, IconButton, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import logo from "../assets/logo-header.png";
import "./config/styles.css";
import { DESKTOP_WIDTH, HEADER_DROPDOWN_LIST } from "../constants";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

export default function Footer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box bgcolor={"#262626"}>
      <Box display={"flex"} flexDirection={"column"} gap={"24px"} p={"30px 40px"} ml={"40px"}>
        <Grid container spacing={1} px={isMobile ? 2 : 1}>
          <Grid item xs={12} sm={3}>
            <Box display={"flex"} flexDirection={"column"} gap={"16px"} alignItems={isMobile ? "center" : "flex-start"} mr={5}>
              <img
                src={logo}
                alt="logo"
                style={{
                  maxWidth: isMobile ? "60px" : "80px",
                  objectFit: "contain",
                  padding: "10px 0",
                }}
              />
              <Typography variant="body2" color={"#E4E4E4"} sx={{ fontSize: "0.8rem", lineHeight: 1.5}}>
                Dự án Sức Mạnh 2000 - Dự án gây quỹ của Ánh Sáng Núi Rừng điều hành bởi Hoàng Hoa Trung - Forbes 30 Under 30 đồng hành bởi Trung tâm Tình Nguyện Quốc Gia.
              </Typography>
              <Typography variant="body2" color={"#E4E4E4"} sx={{ fontSize: "0.8rem", lineHeight: 1.5, mt: 1}}>
                Phát triển bởi đội ngũ điều hành Dự án Nuôi Em, Ánh Sáng Núi Rừng, nhóm Tình nguyện Niềm Tin.
              </Typography>
              <Box display="flex" gap={2} mt={1}>
                <IconButton size="small" sx={{ color: "white", p: 0.5 }}>
                  <FacebookIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ color: "white", p: 0.5 }}>
                  <TwitterIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ color: "white", p: 0.5 }}>
                  <InstagramIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Grid>
          
          <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={5} pt={8} pl={isMobile ? 0 : 10} justifyContent="space-between">
            {HEADER_DROPDOWN_LIST.filter((item) => ["gioi-thieu","quyen-gop","du-an"].includes(item.name)).map((item, index) => (
              <Grid key={index} item xs={6} sm={2.5}>
                <Typography variant="subtitle2" color={"#E4E4E4"} fontWeight="bold" sx={{ fontSize: "0.85rem" }}>
                  {item.title.toUpperCase()}
                </Typography>
                <div className="content-footer">
                  {item.children
                    .filter((_, index) => index <= 4)
                    .map((child, index) => (
                      <Typography key={index} variant="body2" sx={{ fontSize: "0.8rem", cursor: "pointer", whiteSpace: "nowrap"}} onClick={() => (window.location.href = child.path)}>
                        {child.title}
                      </Typography>
                    ))}
                </div>
              </Grid>
            ))}

            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle2" color={"#E4E4E4"} fontWeight="bold" sx={{ fontSize: "0.85rem" }}>
                LIÊN HỆ
              </Typography>
              <div className="content-footer">
                <Typography variant="body2" sx={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>P702 - 62 Bà Triệu - TW Đoàn</Typography>
                <Typography variant="body2" sx={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>Điện thoại: 0975 302 307</Typography>
                <Typography variant="body2" sx={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>Email: niemtingroup@gmail.com</Typography>
              </div>
            </Grid>
          </Box>
        </Grid>
      </Box>
      <Divider sx={{ backgroundColor: "white", height: "2px", width: "100%", mx: "auto" }} />
      <Box display={"flex"} flexDirection={"row"} alignItems={"center"} justifyContent={"center"} py={"20px"}>
        <Typography variant="body2" color={"white"} sx={{ fontSize: "0.8rem" }}>Copyright 2024 © Phát triển bởi đội ngũ điều hành Ánh Sáng Núi Rừng và Dự án Nuôi Em.</Typography>
      </Box>
    </Box>
  );
}
