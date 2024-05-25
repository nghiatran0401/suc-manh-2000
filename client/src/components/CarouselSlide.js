import { Typography, Box } from "@mui/material";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import "./config/styles.css";
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import React from "react";

// TODO: Combine CarouselSlide and CarouselMembers into 1
export default function CarouselSlide({ title, items }) {
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

      <Carousel itemClass="carousel-height-800px" responsive={responsive} autoPlay infinite autoPlaySpeed={5000} arrows={items.length > 1}>
        {items.map((item, index) => (
          <Card key={index} sx={{ m: "16px" }}>
            <CardMedia component="img" alt={item.caption} height="100%" image={item.image} sx={{ ".MuiCardMedia-img": { width: "100%", height: "225px", objectFit: "cover" } }} />

            {(item.caption || item.role || item.description) && (
              <CardContent>
                {item.role && (
                  <CardActions>
                    <div className="card-button">
                      <FacebookOutlinedIcon style={{ color: "red" }} />
                      <EmailOutlinedIcon />
                      <LinkedInIcon />
                      <TwitterIcon />
                    </div>
                  </CardActions>
                )}

                {item.role && (
                  <Typography align="center" gutterBottom variant="h5" component="div">
                    {item.role}
                  </Typography>
                )}

                {item.description && (
                  <Typography align="center" variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                )}

                {item.caption && (
                  <Typography align="center" variant="body2" color="text.secondary">
                    {item.caption}
                  </Typography>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </Carousel>
    </Box>
  );
}
