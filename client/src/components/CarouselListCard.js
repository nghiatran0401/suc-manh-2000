import React from "react";
import { useMediaQuery, Typography, Card as MuiCard, CardContent, Chip, Grid, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { styled } from "@mui/system";
import { Link, useParams } from "react-router-dom";
import { standardizeString, truncateCharacters } from "../helpers";
import charityMoneyIcon from "../assets/charity-money.png";
import Carousel from "react-material-ui-carousel";
import SM2000 from "../assets/companions/SM2000.svg";
import { provincesAndCitiesObj } from "../vietnam-provinces";
import { classificationMapping, statusMapping } from "../constants";

const Card = styled(MuiCard)({
  minHeight: "300px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
  },
  margin: "10px",
});

export default function CarouselListCard(props) {
  const { category } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const itemsPerSlide = isMobile ? 4 : 8;
  const items = props.posts;
  const chunkedItems = [];
  for (let i = 0; i < items.length; i += itemsPerSlide) {
    chunkedItems.push(items.slice(i, i + itemsPerSlide));
  }

  return (
    <Carousel indicators={false}>
      {chunkedItems.map((chunk, index) => (
        <Grid container spacing={1} key={index}>
          {chunk.map((post, idx) => (
            <Grid item xs={6} sm={3} key={idx}>
              <Link replace to={`/${props.category ? props.category : category}/${post.slug}`} style={{ textDecoration: "none" }}>
                <Card>
                  <div style={{ position: "relative", display: "flex", flexDirection: "row" }}>
                    <img style={{ width: "100%", height: "225px", objectFit: "cover" }} src={post.thumbnail ? post.thumbnail : SM2000} alt={post.name} />

                    {post.status && (
                      <div
                        style={{
                          margin: "5px",
                          position: "absolute",
                          top: 0,
                          right: 0,
                          color: "white",
                          backgroundColor: statusMapping[post.status].bgColorHover,
                          padding: "5px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          borderRadius: "10px",
                        }}
                      >
                        <img src={statusMapping[post.status].logo} alt="logo" style={{ width: "15px", height: "15px" }} />
                        <Typography color={"black"} variant="body2" fontWeight={"bold"}>
                          {statusMapping[post.status].name}
                        </Typography>
                      </div>
                    )}
                  </div>

                  <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                    {Boolean(post.totalFund) && (
                      <Chip
                        icon={<img src={charityMoneyIcon} alt="Money icon" />}
                        label={`${post.totalFund > 0 ? Number(post.totalFund).toLocaleString() : "Đang xử lý"}`}
                        variant="outlined"
                        color="primary"
                        sx={{ width: "fit-content" }}
                      />
                    )}

                    <Typography variant="body1" mt={"8px"}>
                      {truncateCharacters(standardizeString(post.name), isMobile ? 60 : 70)}
                    </Typography>

                    <Box display="flex" flexWrap="wrap" gap={"8px"}>
                      {post.classification && (
                        <Typography variant="body2" sx={{ bgcolor: "rgb(41, 182, 246, 0.2)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
                          {classificationMapping[post.classification]}
                        </Typography>
                      )}

                      {post.province && (
                        <Typography variant="body2" sx={{ bgcolor: "rgb(237, 233, 157, 1)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
                          {provincesAndCitiesObj[post.province] ? provincesAndCitiesObj[post.province] : post.province}{" "}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      ))}
    </Carousel>
  );
}
