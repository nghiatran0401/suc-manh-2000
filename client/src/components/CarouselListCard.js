import React from "react";
import { useMediaQuery, Typography, Box, Card as MuiCard ,CardContent, Chip,Grid } from "@mui/material";
import { styled } from "@mui/system";
import { Link, useParams } from "react-router-dom";
import Carousel from "react-multi-carousel";
import { useTheme } from "@mui/material/styles";
import "react-multi-carousel/lib/styles.css";
import "./config/styles.css";
import { truncate } from "../helpers";
import { classificationMapping, statusMapping } from "../constants";
import logoFinsh from "../assets/finish.png";
import logoDonate from "../assets/donate.png";
import logoWorking from "../assets/working.png";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

export default function CarouselListCard(props) {
 console.log("CarouselListCard", props);
  const theme = useTheme();
  const { category } = useParams();

  const Card = styled(MuiCard)({
    minHeight: "500px",
    cursor: "pointer",
    transition: "transform 0.3s ease-in-out",
    "&:hover": {
      transform: "scale(1.05)",
    },
  });
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
      slidesToSlide: 4, // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 2, // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
  };

  return (
    <Box
        maxWidth={"1090px"}
        display={"flex"}
        flexDirection={"column"}
        gap={"24px"}
        m={"10px auto"}
        sx={{
          "@media (max-width: 600px)": {
            m: "16px auto",
            p: "0 16px",
          },
        }}
      >
        <Carousel responsive={responsive} autoPlay infinite autoPlaySpeed={5000}>
           {props.posts.map((post, index) => (
            <Grid key={post.id} >
                  <Link to={`${props.category ? props.category : `/${category}`}/${post.slug}`} style={{ textDecoration: "none" }}>
                <Card style={{ overflow: "visible", minHeight: props.showDescription ? "500px" : "400px", margin: "10px" }}>
                    <div style={{ position: "relative", display: "flex", flexDirection: "row" }}>
                        <img style={{ width: "100%", height: "225px", objectFit: "cover" }} alt={post.name} src={post.thumbnail ?? "https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png"} />
                        {post.status && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    color: "#000",
                                    backgroundColor: post.status === "can-quyen-gop" ? "rgba(255, 76, 48, 1)" : post.status === "dang-xay-dung" ? "rgba(255, 252, 150, 1)" : "rgba(210, 238, 130, 1)",
                                    padding: "5px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >
                                {post.status === "can-quyen-gop" && <img src={logoDonate} alt="logo" style={{ width: "15px", height: "15px" }} />}
                                {post.status === "dang-xay-dung" && <img src={logoWorking} alt="logo" style={{ width: "15px", height: "15px" }} />}
                                {post.status === "da-hoan-thanh" && <img src={logoFinsh} alt="logo" style={{ width: "15px", height: "15px" }} />}
                                {statusMapping[post.status]}
                            </div>
                        )}
                    </div>

                    <CardContent>
                        {post.totalFund !== undefined && <Chip icon={<AttachMoneyIcon />} label={`${post.totalFund > 0 ? post.totalFund.toLocaleString() : "Đang xử lý"}`} variant="outlined" color="primary" />}

                        <Typography variant="body1" fontWeight={"bold"} mt={"16px"}>
                            {post.name}
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

                        {post.classification && (
                            <Typography variant="body2" mt={"16px"} sx={{ bgcolor: "rgb(41, 182, 246, 0.2)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
                                {classificationMapping[post.classification]}
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            </Link>
            </Grid>
        ))}
        </Carousel>
      </Box>
  );
}
