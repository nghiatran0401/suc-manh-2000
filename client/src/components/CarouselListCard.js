import React from "react";
import { Typography, Card as MuiCard, CardContent, Chip, Grid } from "@mui/material";
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

const Card = styled(MuiCard)({
  minHeight: "500px",
  // maxHeight: "fit-content !important",
  cursor: "pointer",
  overflow: "visible",
  margin: "10px",
  position: "relative",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
  },
});

export default function CarouselListCard(props) {
  const { category } = useParams();

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
            <Card>
              <div style={{ position: "relative", display: "flex", flexDirection: "row" }}>
                <img
                  style={{ width: "100%", height: "225px", objectFit: "cover", borderRadius: "4px" }}
                  alt={post.name}
                  src={post.thumbnail ?? "https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png"}
                />
                {post.status && (
                  <div
                    style={{
                      margin: "5px",
                      position: "absolute",
                      top: 0,
                      right: 0,
                      color: "white",
                      backgroundColor: post.status === "can-quyen-gop" ? "rgba(255, 76, 48, 1)" : post.status === "dang-xay-dung" ? "rgba(255, 252, 0, 1)" : "rgba(210, 238, 130, 1)",
                      padding: "5px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      borderRadius: "10px",
                    }}
                  >
                    {post.status === "can-quyen-gop" && <img src={logoDonate} alt="logo" style={{ width: "15px", height: "15px" }} />}
                    {post.status === "dang-xay-dung" && <img src={logoWorking} alt="logo" style={{ width: "15px", height: "15px" }} />}
                    {post.status === "da-hoan-thanh" && <img src={logoFinish} alt="logo" style={{ width: "15px", height: "15px" }} />}
                    <Typography color={"black"} variant="body2" fontWeight={"bold"}>
                      {statusMapping[post.status]}
                    </Typography>
                  </div>
                )}
              </div>

              <CardContent>
                {post.totalFund !== undefined && <Chip icon={<AttachMoneyIcon />} label={`${post.totalFund > 0 ? post.totalFund.toLocaleString() : "Đang xử lý"}`} variant="outlined" color="primary" />}

                <Typography variant="body1" fontWeight={"bold"} mt={"16px"}>
                  {capitalizeEachWord(post.name)}
                </Typography>

                {props.showDescription && post.description && (
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
                )}
              </CardContent>

              {post.classification !== undefined && (
                <Typography position={"absolute"} bottom={"24px"} left={"16px"} variant="body2" sx={{ bgcolor: "rgb(41, 182, 246, 0.2)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
                  {classificationMapping[post.classification]}
                </Typography>
              )}
            </Card>
          </Link>
        </Grid>
      ))}
    </Slider>
  );
}
