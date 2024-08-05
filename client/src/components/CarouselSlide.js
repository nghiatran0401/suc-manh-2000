import React from "react";
import { Card, Grid } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./config/styles.css";

export default function CarouselSlide({ items }) {
  const settings = {
    autoplay: true,
    infinite: false,
    // dots: true,
    arrows: false,
    autoplaySpeed: 4000,
    speed: 2000,
    rows: 1,
    responsive: [
      {
        breakpoint: 3000,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
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
      {items.map((item, index) => (
        <Grid key={index}>
          <Card style={{ margin: "8px" }}>
            <img src={item.image} alt={item.caption} style={{ width: "100%", height: "300px", objectFit: "contain", objectPosition: "center" }} />
          </Card>
        </Grid>
      ))}
    </Slider>
  );
}
