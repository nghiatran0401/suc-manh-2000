import React, { useState } from "react";
import { Typography, Grid, CardContent, Card as MuiCard, Chip, Box } from "@mui/material";
import { styled } from "@mui/system";
import { Link, useParams } from "react-router-dom";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { truncate } from "../helpers";
import { classificationMapping, statusMapping } from "../constants";
import logoFinish from "../assets/finish.png";
import logoDonate from "../assets/donate.png";
import logoWorking from "../assets/working.png";

const Card = styled(MuiCard)({
  minHeight: "500px",
  cursor: "pointer",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
  },
});

export default function CardList(props) {
  const { category } = useParams();

  return props.posts?.map((post) => (
    <Grid key={post.id} item xs={6} sm={6} md={3}>
      <Link to={`${props.category ? props.category : `/${category}`}/${post.slug}`} style={{ textDecoration: "none" }}>
        <Card style={{ minHeight: "500px" }}>
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

          <CardContent sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {post.totalFund !== undefined && (
              <Chip icon={<AttachMoneyIcon />} label={`${post.totalFund > 0 ? Number(post.totalFund).toLocaleString() : "Đang xử lý"}`} variant="outlined" color="primary" sx={{ width: "fit-content" }} />
            )}

            <Typography variant="body1" fontWeight={"bold"}>
              {post.name.toUpperCase()}
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

            <Box display="flex" flexWrap="wrap" gap={"8px"}>
              {/* {post.totalFund !== undefined && (
                <Typography variant="body2" sx={{ bgcolor: "rgb(41, 182, 246, 0.2)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
                  $ {post.totalFund > 0 ? post.totalFund.toLocaleString() : "Đang xử lý"}
                </Typography>
              )} */}
              {post.classification !== undefined && (
                <Typography variant="body2" sx={{ bgcolor: "rgb(41, 182, 246, 0.2)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
                  {classificationMapping[post.classification]}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Link>
    </Grid>
  ));
}
