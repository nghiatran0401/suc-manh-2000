import React from "react";
import { Typography, Grid, CardContent, Card as MuiCard, Chip, Box } from "@mui/material";
import { styled } from "@mui/system";
import { Link, useParams } from "react-router-dom";
import charityMoneyIcon from "../assets/charity-money.png";
import { standardizeString } from "../helpers";
import logoFinish from "../assets/finish.png";
import logoDonate from "../assets/donate.png";
import logoWorking from "../assets/working.png";
import SM2000 from "../assets/companions/SM2000.svg";
import { provincesAndCitiesObj } from "../vietnam-provinces";
import { constructionUnitMapping } from "../constants";

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
                  backgroundColor: ["can-quyen-gop", "canquyengop"].includes(post.status)
                    ? "rgba(255, 76, 48, 1)"
                    : ["dang-xay-dung", "dangxaydung"].includes(post.status)
                    ? "rgba(255, 252, 0, 1)"
                    : "rgba(210, 238, 130, 1)",
                  padding: "5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  borderRadius: "10px",
                }}
              >
                {["can-quyen-gop", "canquyengop"].includes(post.status) && <img src={logoDonate} alt="logo" style={{ width: "15px", height: "15px" }} />}
                {["dang-xay-dung", "dangxaydung"].includes(post.status) && <img src={logoWorking} alt="logo" style={{ width: "15px", height: "15px" }} />}
                {["da-hoan-thanh", "dahoanthanh"].includes(post.status) && <img src={logoFinish} alt="logo" style={{ width: "15px", height: "15px" }} />}
                <Typography color={"black"} variant="body2" fontWeight={"bold"}>
                  {["can-quyen-gop", "canquyengop"].includes(post.status) && "Cần quyên góp"}
                  {["dang-xay-dung", "dangxaydung"].includes(post.status) && "Đang xây dựng"}
                  {["da-hoan-thanh", "dahoanthanh"].includes(post.status) && "Đã hoàn thành"}
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
                  {["truong-hoc"].includes(post.classification) && "Trường học"}
                  {["nha-hanh-phuc"].includes(post.classification) && "Nhà hạnh phúc"}
                  {["khu-noi-tru"].includes(post.classification) && "Khu nội trú"}
                  {["cau-hanh-phuc"].includes(post.classification) && "Cầu đi học"}
                  {["phong-tin-hoc"].includes(post.classification) && "Phòng tin học"}
                  {["wc"].includes(post.classification) && "WC"}
                  {["gieng-nuoc"].includes(post.classification) && "Giếng nước"}
                  {["loai-khac"].includes(post.classification) && "Loại khác"}
                </Typography>
              )}
              {post.province && (
                <Typography variant="body2" sx={{ bgcolor: "rgb(237, 233, 157, 1)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
                  {provincesAndCitiesObj[post.province] ? provincesAndCitiesObj[post.province] : post.province}
                </Typography>
              )}
              {post.constructionUnit && constructionUnitMapping[post.constructionUnit] && (
                <Typography variant="body2" sx={{ bgcolor: "rgb(33, 150, 243, 0.2)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
                {constructionUnitMapping[post.constructionUnit]}
                </Typography> 
              )}
              {post.category && window.location.href.includes("/search") && (
                <Typography variant="body2" sx={{ bgcolor: "rgb(255, 204, 255, 1)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
                  {post.category.replace(/(du-an-|phong-tin-hoc-)/, "")}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Link> 
    </Grid>
  ));
}
