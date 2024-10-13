import React from "react";
import { useMediaQuery, Typography, Card as MuiCard, CardContent, Chip, Grid, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { styled } from "@mui/system";
import { Link, useParams } from "react-router-dom";
import { standardizeString, truncateCharacters } from "../helpers";
import logoFinish from "../assets/finish.png";
import logoDonate from "../assets/donate.png";
import logoWorking from "../assets/working.png";
import charityMoneyIcon from "../assets/charity-money.png";
import Carousel from "react-material-ui-carousel";

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
    <div style={{ maxWidth: "100vw", width: "100%", margin: "0 auto", overflow: "hidden" }}>
      <Carousel indicators={false}>
        {chunkedItems.map((chunk, index) => (
          <Grid container spacing={2} key={index}>
            {chunk.map((post, idx) => (
              <Grid item xs={6} sm={3} key={idx}>
                <Link replace to={`/${props.category ? props.category : category}/${post.slug}`} style={{ textDecoration: "none" }}>
                  <Card>
                    <div style={{ position: "relative", display: "flex", flexDirection: "row" }}>
                      <img
                        style={{ width: "100%", height: "225px", objectFit: "cover" }}
                        src={post.thumbnail ? post.thumbnail : "https://www.selfdriveeastafrica.com/wp-content/uploads/woocommerce-placeholder.png"}
                        alt={post.name}
                      />

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
                          label={`${post.totalFund > 0 ? Number(post.totalFund).toLocaleString() : "Đang xử lý"}`}
                          variant="outlined"
                          color="primary"
                          sx={{ width: "fit-content" }}
                        />
                      )}

                      <Typography variant="body1" mt={"16px"}>
                        {truncateCharacters(standardizeString(post.name), isMobile ? 60 : 70)}
                      </Typography>

                      <Box display="flex" flexWrap="wrap" gap={"8px"}>
                        {post.classification && (
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

                        {post.province && (
                          <Typography variant="body2" sx={{ bgcolor: "rgb(237, 233, 157, 1)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
                            {post.province}
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
    </div>
  );
}
