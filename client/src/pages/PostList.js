import React, { useState, useEffect } from "react";
import axios from "axios";
import { useMediaQuery, Box, LinearProgress, Typography, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroller";
import { POSTS_PER_PAGE, SERVER_URL, HEADER_DROPDOWN_LIST, totalFundMapping, classificationMapping, statusMapping } from "../constants";
import HeaderBar from "../components/Header";
import Companion from "../components/Companion";
import Footer from "../components/Footer";
import CarouselMembers from "../components/CarouselMembers";
import CardList from "../components/CardList";
import { findTitle } from "../helpers";
import LoadingScreen from "../components/LoadingScreen";
import { StyledSelectComponent } from "../components/StyledComponent";
import { useSearchParams } from "react-router-dom";

export default function PostList() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParams = searchParams.get("filter") || "{}";

  const [filterValue, setFilterValue] = useState(() => JSON.parse(filterParams.replace(/(\w+):/g, '"$1":').replace(/:([^,}]+)/g, ':"$1"')));
  const [posts, setPosts] = useState(undefined);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalFilterPosts, setTotalFilterPosts] = useState(0);
  const [classificationFilter, setClassificationFilter] = useState(filterValue.classificationFilter ? filterValue.classificationFilter : "all");
  const [totalFundFilter, setTotalFundFilter] = useState(filterValue.totalFundFilter ? filterValue.totalFundFilter : "all");
  const [statusFilter, setStatusFilter] = useState(filterValue.statusFilter ? filterValue.statusFilter : "all");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const title = ("Lưu trữ danh mục: " + findTitle(HEADER_DROPDOWN_LIST, "/" + category)).toUpperCase();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isProject = category.includes("du-an") || category.includes("phong-tin-hoc");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setLoading(true);

    const ALL = "all";
    const filterObj = {};
    if (classificationFilter !== ALL || totalFundFilter !== ALL || statusFilter !== ALL) {
      if (classificationFilter !== ALL) filterObj.classificationFilter = classificationFilter;
      if (totalFundFilter !== ALL) filterObj.totalFundFilter = totalFundFilter;
      if (statusFilter !== ALL) filterObj.statusFilter = statusFilter;

      let filterString = JSON.stringify(filterObj);
      filterString = filterString.replace(/"(\w+)":/g, "$1:").replace(/:"([^"]+)"/g, ":$1");
      const queryString = "?filter=" + filterString;
      window.history.pushState({}, "", window.location.pathname + queryString);
    } else {
      window.history.pushState({}, "", window.location.pathname);
    }

    axios
      .get(SERVER_URL + "/" + category, {
        params: {
          _start: 0,
          _end: POSTS_PER_PAGE,
          filter: { classificationFilter, totalFundFilter, statusFilter },
        },
      })
      .then((posts) => {
        setTotalPosts(Number(posts.headers["x-total-count"]));
        setTotalFilterPosts(Number(posts.headers["x-total-filter-count"]));
        setPosts(posts.data);
        setHasMore(posts.data.length >= POSTS_PER_PAGE);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [category, classificationFilter, totalFundFilter, statusFilter]);

  const fetchMoreData = () => {
    const nextPage = Math.floor(posts.length / POSTS_PER_PAGE);

    axios
      .get(SERVER_URL + "/" + category, { params: { _start: nextPage * POSTS_PER_PAGE, _end: (nextPage + 1) * POSTS_PER_PAGE, filter: { classificationFilter, totalFundFilter, statusFilter } } })
      .then((newPosts) => {
        setPosts([...posts, ...newPosts.data]);
        if (newPosts.data.length === 0 || newPosts.data.length < POSTS_PER_PAGE) {
          setHasMore(false);
        }
      })
      .catch((e) => console.error(e));
  };

  if (!posts || posts.length < 0) return <LoadingScreen />;
  return (
    <Box>
      <HeaderBar />

      <Box m={isMobile ? "24px 16px" : "88px auto"} display={"flex"} flexDirection={"column"} gap={"40px"} maxWidth={"1080px"}>
        {title && (
          <Typography variant="h5" fontWeight="bold" color={"#000"} textAlign={"center"}>
            {title}
          </Typography>
        )}

        {isProject && totalPosts > POSTS_PER_PAGE && (
          <Box display={"flex"} flexDirection={isMobile ? "column" : "row"} justifyContent={"center"} alignItems={"center"} gap={"16px"}>
            <StyledSelectComponent
              label="Loại dự án"
              inputWidth={200}
              isMobile={isMobile}
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
              isMobile={isMobile}
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
              isMobile={isMobile}
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

        {loading ? (
          <LinearProgress />
        ) : posts.length === 0 ? (
          <Typography variant="h6" textAlign={"center"}>
            Không tìm thấy dự án nào
          </Typography>
        ) : (
          <>
            {isProject && totalPosts > POSTS_PER_PAGE && (
              <Typography variant="body1" textAlign={"right"}>
                Số dự án: {totalFilterPosts}/{totalPosts}
              </Typography>
            )}

            <Box maxWidth={"1080px"} width={"100%"} m={"auto"} display={"flex"} flexDirection={"column"} gap={"32px"}>
              <InfiniteScroll
                dataLength={isProject ? totalFilterPosts : posts.length}
                hasMore={hasMore}
                loader={<LinearProgress sx={{ mt: "100px" }} />}
                loadMore={fetchMoreData}
                scrollThreshold={0.5}
                style={{ overflow: "hidden" }}
              >
                <Grid container spacing={3} p={"16px"}>
                  <CardList posts={posts} showDescription={false} />
                </Grid>
              </InfiniteScroll>
            </Box>
          </>
        )}
      </Box>

      <CarouselMembers />
      <Companion />
      <Footer />
    </Box>
  );
}
