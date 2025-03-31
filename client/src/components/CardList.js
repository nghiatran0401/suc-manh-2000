import React from "react";
import { Typography, Grid, CardContent, Card as MuiCard, Chip, Box } from "@mui/material";
import { styled } from "@mui/system";
import { Link, useParams } from "react-router-dom";
import charityMoneyIcon from "../assets/charity-money.png";
import { standardizeString } from "../helpers";
import SM2000 from "../assets/companions/SM2000.svg";
import { provincesAndCitiesObj } from "../vietnam-provinces";
import { constructionUnitMapping, statusMapping, classificationMapping } from "../constants";

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
});

export default function CardList(props) {
  const { category } = useParams();

  return props.posts.map((post, ix) => (
    <Grid key={ix} item xs={6} sm={6} md={3}>
      <Link to={`${props.category ? props.category : category ? `/${category}` : post.redisKey ? `/${post.redisKey.split(":")[1]}` : ""}/${post.slug}`} style={{ textDecoration: "none" }}>
        <Card>
          <div style={{ position: "relative", display: "flex", flexDirection: "row" }}>
            <img style={{ width: "100%", height: "225px", objectFit: "cover" }} src={post.thumbnail ? post.thumbnail : SM2000} alt={standardizeString(post.name)} />

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
            {post.subStatus && post.status !== "da-hoan-thanh" && (
              <div
                style={{
                  margin: "5px",
                  position: "absolute",
                  top: 40,
                  right: 0,
                  color: "white",
                  backgroundColor: statusMapping[post.subStatus].bgColorHover,
                  padding: "5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  borderRadius: "10px",
                }}
              >
                <img src={statusMapping[post.subStatus].logo} alt="logo" style={{ width: "15px", height: "15px" }} />
                <Typography color={"black"} variant="body2" fontWeight={"bold"}>
                  {statusMapping[post.subStatus].name}
                </Typography>
              </div>
            )}
          </div>

          <CardContent sx={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%", justifyContent: "space-between" }}>
            {Boolean(post.totalFund) && (
              <Chip
                icon={<img src={charityMoneyIcon} alt="Money icon" style={{ marginRight: "1px" }} />}
                label={`${post.totalFund > 0 ? Number(post.totalFund).toLocaleString() + " VND" : "Đang xử lý"}`}
                variant="outlined"
                color="primary"
                sx={{ width: "fit-content" }}
              />
            )}

            <Typography variant="body1">{standardizeString(post.name)}</Typography>

            <Box display="flex" flexWrap="wrap" gap={"8px"}>
              {post.classification && (
                <Typography variant="body2" sx={{ bgcolor: "rgb(41, 182, 246, 0.2)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
                  {classificationMapping[post.classification]}
                </Typography>
              )}
              {post.province && (
                <Typography variant="body2" sx={{ bgcolor: "rgb(237, 233, 157, 1)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
                  {provincesAndCitiesObj[post.province] ? provincesAndCitiesObj[post.province] : post.province}
                </Typography>
              )}
              {post.constructionUnit && constructionUnitMapping[post.constructionUnit] && (
                <Typography variant="body2" sx={{ bgcolor: "rgb(255, 192, 203, 1)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
                  {constructionUnitMapping[post.constructionUnit]}
                </Typography>
              )}
              {post.category && window.location.href.includes("/tim-kiem") && (
                <Typography variant="body2" sx={{ bgcolor: "rgb(255, 204, 255, 1)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
                  {post.category.replace(/(du-an-)/, "")}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Link>
    </Grid>
  ));
}
