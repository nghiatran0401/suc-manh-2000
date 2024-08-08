import React from "react";
import { Card, Grid } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./config/styles.css";
import logo from "../assets/logo-header.png";

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
      {items.length > 0 &&
        items.map((item, index) => (
          <Grid key={index}>
            <Card style={{ margin: "8px" }}>
              {item.image ? (
                <img src={item.image} alt={item.caption} style={{ width: "100%", height: "300px", objectFit: "contain", objectPosition: "center" }} />
              ) : (
                <div style={{ width: "100%", height: "300px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <img src={logo} style={{ height: "100px", objectFit: "contain", objectPosition: "center" }} />
                </div>
              )}
            </Card>
          </Grid>
        ))}

      {items.length === 0 && (
        <Grid>
          <Card style={{ margin: "8px" }}>
            <div style={{ width: "100%", height: "300px", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img src={logo} style={{ height: "100px", objectFit: "contain", objectPosition: "center" }} />
            </div>
          </Card>
        </Grid>
      )}
    </Slider>
  );
}
