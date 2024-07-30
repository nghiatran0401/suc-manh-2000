import React, { useEffect, useState } from "react";
import { Typography, Grid, CardContent, Card as MuiCard, Chip, Box } from "@mui/material";
import { styled } from "@mui/system";
import { Link, useParams } from "react-router-dom";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { capitalizeEachWord, truncate } from "../helpers";
import { classificationMapping } from "../constants";
import logoFinish from "../assets/finish.png";
import logoDonate from "../assets/donate.png";
import logoWorking from "../assets/working.png";
import { provincesAndCities } from "../vietnam-provinces";

const Card = styled(MuiCard)({
  minHeight: "500px",
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

  return props.posts?.map((post) => (
    <Grid key={post.id} item xs={6} sm={6} md={3}>
      <Link to={`${props.category ? props.category : category ? `/${category}` : post.redisKey ? `/${post.redisKey.split(":")[1]}` : ""}/${post.slug}`} style={{ textDecoration: "none" }}>
        <Card>
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
            {post.totalFund !== undefined && (
              <Chip icon={<AttachMoneyIcon />} label={`${post.totalFund > 0 ? Number(post.totalFund).toLocaleString() : "Đang xử lý"}`} variant="outlined" color="primary" sx={{ width: "fit-content" }} />
            )}

            <Typography variant="body1" fontWeight={"bold"}>
              {capitalizeEachWord(post.name)}
            </Typography>

            <Box display="flex" flexWrap="wrap" gap={"8px"}>
              {post.classification !== undefined && (
                <Typography variant="body2" sx={{ bgcolor: "rgb(41, 182, 246, 0.2)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
                  {["truong-hoc", "truonghoc"].includes(post.classification) && "Trường học"}
                  {["nha-hanh-phuc", "nhahanhphuc"].includes(post.classification) && "Nhà hạnh phúc"}
                  {["khu-noi-tru", "khunoitru"].includes(post.classification) && "Khu nội trú"}
                  {["cau-hanh-phuc", "cauhanhphuc"].includes(post.classification) && "Cầu hạnh phúc"}
                  {["phong-tin-hoc", "phongtinhoc"].includes(post.classification) && "Phòng tin học"}
                  {["wc"].includes(post.classification) && "WC"}
                  {["loai-khac", "loaikhac"].includes(post.classification) && "Loại khác"}
                </Typography>
              )}

              {post.location?.province !== null && (
                <Typography variant="body2" sx={{ bgcolor: "rgb(237, 233, 157, 1)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
                  {provincesAndCities.find((i) => i.provinceValue === post.location?.province)?.province ?? "Khác"}
                </Typography>
              )}
            </Box>

            {/* {props.showDescription && post.description && (
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
            )} */}
          </CardContent>
        </Card>
      </Link>
    </Grid>
  ));
}
