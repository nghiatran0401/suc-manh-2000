import React from "react";
import { Card, Grid } from "@mui/material";
import Carousel from "react-material-ui-carousel";
import logo from "../assets/logo-header.png";

export default function CarouselSlide({ items }) {
  return (
    <div style={{ maxWidth: "100vw", width: "100%", margin: "0 auto", overflow: "hidden" }}>
      <Carousel navButtonsAlwaysVisible={items.length > 1} navButtonsAlwaysInvisible={items.length <= 1} indicators={false}>
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
      </Carousel>
    </div>
  );
}
