import React, { useState, useEffect } from "react";
import axios from "axios";
import { useMediaQuery, Box, Pagination, LinearProgress, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import { POSTS_PER_PAGE, SERVER_URL, HEADER_DROPDOWN_LIST, totalFundMapping, classificationMapping, statusMapping } from "../constants";
import HeaderBar from "../components/Header";
import Companion from "../components/Companion";
import Footer from "../components/Footer";
import CarouselMembers from "../components/CarouselMembers";
import CardList from "../components/CardList";
import { findTitle } from "../helpers";
import LoadingScreen from "../components/LoadingScreen";
import { StyledSelectComponent } from "../components/StyledComponent";

export default function PostList() {
  const { category } = useParams();
  const [posts, setPosts] = useState(undefined);
  const [totalPosts, setTotalPosts] = useState(0);
  const [page, setPage] = useState(1);
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [totalFundFilter, setTotalFundFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const title = ("Lưu trữ danh mục: " + findTitle(HEADER_DROPDOWN_LIST, "/" + category)).toUpperCase();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isProject = category.includes("du-an");

  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const startData = (page - 1) * POSTS_PER_PAGE;
    const endData = startData + POSTS_PER_PAGE;

    axios
      .get(SERVER_URL + "/" + category, { params: { _start: startData, _end: endData, filter: { classificationFilter, totalFundFilter, statusFilter } } })
      .then((posts) => {
        setTotalPosts(posts.headers["x-total-count"]);
        setPosts(posts.data);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [page, category, classificationFilter, totalFundFilter, statusFilter]);

  if (!posts) return <LoadingScreen />;
  return (
    <Box>
      <HeaderBar />

      <Box m={isMobile ? "24px 16px" : "88px auto"} display={"flex"} flexDirection={"column"} gap={"40px"} maxWidth={"1080px"}>
        {title && (
          <Typography variant="h5" fontWeight="bold" color={"#000"} textAlign={"center"}>
            {title}
          </Typography>
        )}

        {isProject && (
          <Box display={"flex"} flexDirection={isMobile ? "column" : "row"} justifyContent={"flex-end"} gap={"16px"}>
            <StyledSelectComponent
              label="Loại dự án"
              inputWidth={200}
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              options={[
                {
                  label: "Tất cả",
                  value: "all",
                },
                ...Object.entries(classificationMapping).map(([value, label]) => ({
                  label,
                  value,
                })),
              ]}
            />

            <StyledSelectComponent
              label="Khoảng tiền"
              inputWidth={200}
              value={totalFundFilter}
              onChange={(e) => setTotalFundFilter(e.target.value)}
              options={[
                {
                  label: "Tất cả",
                  value: "all",
                },
                ...Object.entries(totalFundMapping).map(([value, label]) => ({
                  label,
                  value,
                })),
              ]}
            />

            <StyledSelectComponent
              label="Tiến độ"
              inputWidth={200}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                {
                  label: "Tất cả",
                  value: "all",
                },
                ...Object.entries(statusMapping).map(([value, label]) => ({
                  label,
                  value,
                })),
              ]}
            />
          </Box>
        )}

        {posts.length === 0 ? (
          <Typography variant="h6" textAlign={"center"}>
            Không tìm thấy dự án nào
          </Typography>
        ) : loading ? (
          <LinearProgress />
        ) : (
          <CardList posts={posts} showDescription={false} />
        )}

        {totalPosts > POSTS_PER_PAGE && posts.length >= POSTS_PER_PAGE && (
          <Box display={"flex"} justifyContent={"center"} mt={"64px"}>
            <Pagination count={Math.ceil(totalPosts / POSTS_PER_PAGE)} page={page} onChange={(event, value) => setPage(value)} variant="outlined" shape="rounded" />
          </Box>
        )}
      </Box>

      <CarouselMembers />
      <Companion />
      <Footer />
    </Box>
  );
}
