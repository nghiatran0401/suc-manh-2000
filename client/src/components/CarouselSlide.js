import React from "react";
import { Typography, Box, Card, CardContent } from "@mui/material";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./config/styles.css";

// TODO: Combine CarouselSlide and CarouselMembers into 1

export default function CarouselSlide({ title, items, position }) {
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
  };

  return (
    <Box display={"flex"} flexDirection={"column"} gap={"16px"}>
      {title && (
        <Typography variant="h5" fontWeight="bold">
          {title}
        </Typography>
      )}

      <Carousel itemClass={position === "progress" ? "carousel-height-300px" : "carousel-height-800px"} responsive={responsive} autoPlay infinite autoPlaySpeed={5000} arrows={items.length > 1}>
        {items.map((item, index) => (
          <Card key={index} style={{ margin: "8px" }}>
            <img src={item.image} alt={item.caption} style={{ width: "100%", height: "300px", objectFit: "contain", objectPosition: "center" }} />

            {/* {item.caption && (
              <CardContent>
                <Typography align="center" variant="body2" color="text.secondary">
                  {item.caption}
                </Typography>
              </CardContent>
            )} */}
          </Card>
        ))}
      </Carousel>
    </Box>
  );
}
