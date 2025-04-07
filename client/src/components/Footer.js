import React from "react";
import { useMediaQuery, Box, Grid, Typography, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import logo from "../assets/logo-header.png";
import "./config/styles.css";
import { DESKTOP_WIDTH, HEADER_DROPDOWN_LIST } from "../constants";

export default function Footer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box bgcolor={"#262626"} width="100%">
      <Box display="flex" flexDirection={isMobile ? "column" : "row"} flexWrap="wrap" gap="24px" py="30px" px={{ xs: 2, md: 0 }} maxWidth={DESKTOP_WIDTH} mx="auto">
        <Box width={isMobile ? "100%" : "30%"} display="flex" flexDirection="column" gap={2}>
          <Box textAlign={isMobile ? "center" : "left"}>
            <img
              src={logo}
              alt="logo"
              style={{
                maxWidth: "80px",
                width: "100%",
                height: "auto",
                objectFit: "contain",
                padding: "10px 0",
              }}
            />
          </Box>

          <Box textAlign={isMobile ? "center" : "left"} display="flex" flexDirection="column" gap={1}>
            <Typography variant="body2" color="#E4E4E4">
              Dự án Sức Mạnh 2000 - Dự án gây quỹ của Ánh Sáng Núi Rừng điều hành bởi Hoàng Hoa Trung - Forbes 30 Under 30 đồng hành với Trung tâm Tình Nguyện Quốc Gia (thuộc Trung ương Đoàn).
            </Typography>
          </Box>

          {isMobile && (
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="#E4E4E4" fontWeight="bold" mb={1}>
                LIÊN HỆ
              </Typography>
              <Box sx={{ color: "#b4b4b4", display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="body2" sx={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                  P702 - 62 Bà Triệu - TW Đoàn
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                  <strong>Hotline:</strong>
                  <ul style={{ margin: 0 }}>
                    <li>Hoàng Hoa Trung 0975302307</li>
                    <li>Nguyễn Thị Hiền 0986832256</li>
                  </ul>
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                  <strong>Email:</strong>
                  <ul style={{ margin: 0 }}>
                    <li>duansucmanh2000@gmail.com</li>
                    <li>niemtingroup@gmail.com</li>
                  </ul>
                </Typography>
              </Box>
            </Grid>
          )}
        </Box>

        {!isMobile && (
          <Box width="60%" display="flex" flexDirection={isMobile ? "column" : "row"} justifyContent="space-around">
            {HEADER_DROPDOWN_LIST.filter((item) => ["gioi-thieu", "quyen-gop", "du-an"].includes(item.name)).map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Typography variant="subtitle2" color="#E4E4E4" fontWeight="bold" sx={{ fontSize: "0.85rem", mb: 1 }}>
                  {item.title.toUpperCase()}
                </Typography>
                <Box className="content-footer">
                  {item.children.slice(0, 5).map((child, idx) => (
                    <Typography
                      key={idx}
                      variant="body2"
                      sx={{
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        mb: 0.5,
                      }}
                      onClick={() => (window.location.href = child.path)}
                    >
                      {child.title}
                    </Typography>
                  ))}
                </Box>
              </Grid>
            ))}

            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="#E4E4E4" fontWeight="bold" sx={{ fontSize: "0.85rem", mb: 1 }}>
                LIÊN HỆ
              </Typography>
              <Box className="content-footer">
                <Typography variant="body2" sx={{ fontSize: "0.8rem", whiteSpace: "nowrap", mb: 0.5 }}>
                  P702 - 62 Bà Triệu - TW Đoàn
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.8rem", whiteSpace: "nowrap", mb: 0.5 }}>
                  Điện thoại: 0975 302 307
                </Typography>

                <Typography variant="body2" sx={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                  Email: niemtingroup@gmail.com
                </Typography>
              </Box>
            </Grid>
          </Box>
        )}
      </Box>

      <Divider sx={{ backgroundColor: "white", height: "2px", width: "100%", mx: "auto" }} />

      <Box display={"flex"} flexDirection={"row"} alignItems={"center"} justifyContent={"center"} py={"20px"} px={isMobile ? "15px" : "0px"}>
        <Typography variant="body2" color={"white"} sx={{ fontSize: "0.8rem" }} textAlign="center">
          Copyright 2024 © <br />
          Phát triển bởi đội ngũ điều hành Dự án Nuôi Em, Ánh Sáng Núi Rừng, nhóm Tình nguyện Niềm Tin
        </Typography>
      </Box>
    </Box>
  );
}
