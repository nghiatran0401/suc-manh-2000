import React from "react";
import { useMediaQuery, Typography, Card as MuiCard, CardContent, Chip, Grid, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { styled } from "@mui/system";
import { Link, useParams } from "react-router-dom";
import "react-multi-carousel/lib/styles.css";
import "./config/styles.css";
import { capitalizeEachWord, truncate } from "../helpers";
import { classificationMapping, statusMapping } from "../constants";
import logoFinish from "../assets/finish.png";
import logoDonate from "../assets/donate.png";
import logoWorking from "../assets/working.png";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { provincesAndCities } from "../vietnam-provinces";

const Card = styled(MuiCard)(({ isMobile }) => ({
  minHeight: isMobile ? "fit-content" : "400px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
  },
  margin: "10px",
}));

export default function CarouselListCard(props) {
  const { category } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const settings = {
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 2000,
    rows: props.posts.length > 4 ? 2 : 1,
    responsive: [
      {
        breakpoint: 3000,
        settings: {
          slidesToShow: 4,
          slidesToScroll: props.posts.length > 4 ? 4 : props.posts.length,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 464,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <Slider {...settings}>
      {props.posts.map((post, index) => (
        <Grid key={post.id + index}>
          <Link replace to={`/${props.category ? props.category : category}/${post.slug}`} style={{ textDecoration: "none" }}>
            <Card isMobile={isMobile}>
              <div style={{ position: "relative", display: "flex", flexDirection: "row" }}>
                <img style={{ width: "100%", height: "225px", objectFit: "cover" }} src={post.thumbnail ?? "https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png"} alt={post.name} />

                {post.status !== undefined && (
                  <div
                    style={{
                      margin: "5px",
                      position: "absolute",
                      top: 0,
                      right: 0,
                      color: "white",
                      backgroundColor: ["can-quyen-gop", "canquyengop"].includes(post.status)
                        ? "rgba(255, 76, 48, 1)"
                        : ["dang-xay-dung", "dangxaydung"].includes(post.status)
                        ? "rgba(255, 252, 0, 1)"
                        : "rgba(210, 238, 130, 1)",
                      padding: "5px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      borderRadius: "10px",
                    }}
                  >
                    {["can-quyen-gop", "canquyengop"].includes(post.status) && <img src={logoDonate} alt="logo" style={{ width: "15px", height: "15px" }} />}
                    {["dang-xay-dung", "dangxaydung"].includes(post.status) && <img src={logoWorking} alt="logo" style={{ width: "15px", height: "15px" }} />}
                    {["da-hoan-thanh", "dahoanthanh"].includes(post.status) && <img src={logoFinish} alt="logo" style={{ width: "15px", height: "15px" }} />}
                    <Typography color={"black"} variant="body2" fontWeight={"bold"}>
                      {["can-quyen-gop", "canquyengop"].includes(post.status) && "Cần quyên góp"}
                      {["dang-xay-dung", "dangxaydung"].includes(post.status) && "Đang xây dựng"}
                      {["da-hoan-thanh", "dahoanthanh"].includes(post.status) && "Đã hoàn thành"}
                    </Typography>
                  </div>
                )}
              </div>

              <CardContent sx={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%", justifyContent: "space-between", minHeight: isMobile ? "fit-content" : "175px" }}>
                {post.totalFund !== undefined && (
                  <Chip icon={<AttachMoneyIcon />} label={`${post.totalFund > 0 ? Number(post.totalFund).toLocaleString() : "Đang xử lý"}`} variant="outlined" color="primary" sx={{ width: "fit-content" }} />
                )}

                <Typography variant="body1" mt={"16px"}>
                  {capitalizeEachWord(post.name)}
                </Typography>

                <Box display="flex" flexWrap="wrap" gap={"8px"}>
                  {post.classification !== undefined && (
                    <Typography variant="body2" sx={{ bgcolor: "rgb(41, 182, 246, 0.2)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
                      {["truong-hoc", "truonghoc"].includes(post.classification) && "Trường học"}
                      {["nha-hanh-phuc", "nhahanhphuc"].includes(post.classification) && "Nhà hạnh phúc"}
                      {["khu-noi-tru", "khunoitru"].includes(post.classification) && "Khu nội trú"}
                      {["cau-hanh-phuc", "cauhanhphuc"].includes(post.classification) && "Cầu hạnh phúc"}
                      {["phong-tin-hoc", "phongtinhoc"].includes(post.classification) && "Phòng tin học"}
                      {["wc"].includes(post.classification) && "WC"}
                      {["loai-khac", "loaikhac"].includes(post.classification) && "Loại khác"}
                    </Typography>
                  )}

                  {post.location?.province !== null && (
                    <Typography variant="body2" sx={{ bgcolor: "rgb(237, 233, 157, 1)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
                      {provincesAndCities.find((i) => i.provinceValue === post.location?.province)?.province ?? "Khác"}
                    </Typography>
                  )}
                </Box>

                {/* {props.showDescription && post.description && (
                  <>
                    <div
                      style={{
                        backgroundColor: "rgba(0, 0, 0, .1)",
                        display: "block",
                        height: "2px",
                        margin: "0.5em 0",
                        maxWidth: "30px",
                        width: "100%",
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" dangerouslySetInnerHTML={{ __html: truncate(post.description.replace(/h1/g, "div"), 100) }} />
                  </>
                )} */}
              </CardContent>
            </Card>
          </Link>
        </Grid>
      ))}
    </Slider>
  );
}
