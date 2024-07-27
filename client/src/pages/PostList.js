import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useMediaQuery, Box, LinearProgress, Typography, Grid, Chip, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroller";
import { POSTS_PER_PAGE, SERVER_URL, HEADER_DROPDOWN_LIST, totalFundMapping, classificationMapping, statusMapping, statusColorMapping, statusLogoMapping, statusColorHoverMapping } from "../constants";
import HeaderBar from "../components/Header";
import Companion from "../components/Companion";
import Footer from "../components/Footer";
import CarouselMembers from "../components/CarouselMembers";
import CardList from "../components/CardList";
import { findTitle } from "../helpers";
import LoadingScreen from "../components/LoadingScreen";
import { StyledSelectComponent } from "../components/StyledComponent";
import MetaDecorator from "../components/MetaDecorater";
import CountUp from "react-countup";
import { useSearchParams } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function PostList() {
  const { category } = useParams();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [posts, setPosts] = useState(undefined);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalFilterPosts, setTotalFilterPosts] = useState(0);
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [totalFundFilter, setTotalFundFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [statsData, setStatsData] = useState({});

  const isProject = category.includes("du-an") || category.includes("phong-tin-hoc");
  const title = ("Lưu trữ danh mục: " + findTitle(HEADER_DROPDOWN_LIST, "/" + category)).toUpperCase();
  const EXCLUDED_FILTER = ["phong-tin-hoc", "wc", "loai-khac"];
  const scrollRef = useRef(null);

  useEffect(() => {
    const status = urlSearchParams.get("statusFilter");
    const classification = urlSearchParams.get("classificationFilter");
    const totalFundFilter = urlSearchParams.get("totalFundFilter");

    if (status) setStatusFilter(status);
    if (classification) setClassificationFilter(classification);
    if (totalFundFilter) setTotalFundFilter(totalFundFilter);
  }, []);

  useEffect(() => {
    const status = urlSearchParams.get("statusFilter");
    const classification = urlSearchParams.get("classificationFilter");
    const totalFundFilter = urlSearchParams.get("totalFundFilter");

    const timer = setTimeout(() => {
      if (scrollRef.current && (status || classification || totalFundFilter)) {
        window.scrollTo({
          top: scrollRef.current.offsetTop - 80,
          behavior: "smooth",
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (scrollRef.current) {
      window.scrollTo({
        top: scrollRef.current.offsetTop - 80,
        behavior: "smooth",
      });
    }
    setLoading(true);
    console.time("Loading Time Post List");

    const filters = {};
    if (classificationFilter === "all") {
      urlSearchParams.delete("classificationFilter");
    } else if (classificationFilter) {
      filters.classificationFilter = classificationFilter;
    }

    if (statusFilter === "all") {
      urlSearchParams.delete("statusFilter");
    } else if (statusFilter) {
      filters.statusFilter = statusFilter;
    }

    if (totalFundFilter === "all") {
      urlSearchParams.delete("totalFundFilter");
    } else if (totalFundFilter) {
      filters.totalFundFilter = totalFundFilter;
    }

    if (Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, value]) => urlSearchParams.set(key, value));
    }
    setUrlSearchParams(urlSearchParams);

    Promise.all([
      axios.get(SERVER_URL + "/" + category, {
        params: {
          _start: 0,
          _end: POSTS_PER_PAGE,
          filter: { classificationFilter, totalFundFilter, statusFilter },
        },
      }),
      axios.get(`${SERVER_URL}/${category}/stats`),
    ])
      .then(([postsResponse, statsResponse]) => {
        setTotalPosts(Number(postsResponse.headers["x-total-count"]));
        setTotalFilterPosts(Number(postsResponse.headers["x-total-filter-count"]));
        setPosts(postsResponse.data);
        setHasMore(postsResponse.data.length >= POSTS_PER_PAGE);

        setStatsData(statsResponse.data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
        console.timeEnd("Loading Time Post List");
      });
  }, [category, classificationFilter, totalFundFilter, statusFilter]);

  const fetchMoreData = () => {
    const nextPage = Math.floor(posts.length / POSTS_PER_PAGE);
    axios
      .get(SERVER_URL + "/" + category, {
        params: {
          _start: nextPage * POSTS_PER_PAGE,
          _end: (nextPage + 1) * POSTS_PER_PAGE,
          filter: { classificationFilter, totalFundFilter, statusFilter },
        },
      })
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

        {isProject && (
          <Grid container display={"flex"} alignItems={"center"} justifyContent={"center"} gap={"16px"} borderRadius={"8px"}>
            <Box display={"flex"} flexDirection={"column"} textAlign={"center"} alignItems={"center"} gap={"16px"} m={"0 auto"}>
              <Typography variant="h5" fontWeight={700}>
                Thống kê nhanh
              </Typography>

              <Box bgcolor={"#FFF1F0"} p={6} borderRadius={2}>
                <Typography variant="h3" fontWeight="bold" color={"red"}>
                  <CountUp start={0} end={totalPosts} duration={10} />
                </Typography>
                <Typography fontSize={"20px"} fontWeight={600} variant="h4">
                  Tổng dự án trong năm
                </Typography>
              </Box>
            </Box>

            <Grid
              container
              item
              spacing={2}
              sx={{
                border: "1px solid #fff",
                paddingBottom: 2,
                borderRadius: 2,
                margin: "16px auto",
                boxShadow: 2,
                width: "100%",
                display: "flex",
              }}
            >
              {Object.entries(classificationMapping)
                .filter(([v, l]) => !EXCLUDED_FILTER.includes(v))
                .map(([value, label], index) => (
                  <Grid item display={"flex"} flexDirection={"column"} gap={"16px"} md={3} sm={6} xs={6} paddingTop={0} paddingRight={2} borderRight={index === 3 || (isMobile && index === 1) ? "" : "2px solid #D9D9D9"}>
                    <div>
                      <Typography variant="h5" fontWeight={600} textAlign={"center"}>
                        {statsData[value]?.count ?? 0}
                      </Typography>
                      <Typography variant="body1" textAlign={"center"}>
                        {label}
                      </Typography>
                    </div>

                    <Box
                      style={{
                        display: "flex",
                        gap: isMobile ? "2px" : "8px",
                        justifyContent: "center",
                      }}
                    >
                      {Object.keys(statusMapping).map((status) => (
                        <Chip
                          variant="outline"
                          avatar={<img src={statusLogoMapping[status]} alt="logo" />}
                          label={statsData[value]?.[status] ?? 0}
                          sx={{
                            backgroundColor: statusColorMapping[status],
                            height: "24px",
                            "& .MuiChip-avatar": {
                              width: "16px",
                              height: "16px",
                            },
                            "&:hover": {
                              backgroundColor: statusColorHoverMapping[status],
                            },
                          }}
                          onClick={() => {
                            setClassificationFilter(value);
                            setStatusFilter(status);
                            setTotalFundFilter("all");
                          }}
                        />
                      ))}
                    </Box>
                    <Box display="flex" justifyContent="center" width="100%" height={"32px"}>
                      <Button
                        variant="outlined"
                        sx={{ width: "100%", textTransform: "none", color: "#000", borderColor: "#D9D9D9", borderRadius: "32px", m: isMobile ? "0px" : "0px 16px" }}
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => {
                          setClassificationFilter(value);
                          setStatusFilter("all");
                          setTotalFundFilter("all");
                        }}
                      >
                        Xem tất cả
                      </Button>
                    </Box>
                  </Grid>
                ))}
            </Grid>
          </Grid>
        )}

        {isProject && totalPosts > POSTS_PER_PAGE && (
          <Box display={"flex"} flexDirection={isMobile ? "column" : "row"} justifyContent={isMobile ? "center" : "flex-end"} alignItems={"center"} gap={"16px"}>
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
                ...Object.entries(classificationMapping)
                  .filter(([v, l]) => !EXCLUDED_FILTER.includes(v))
                  .map(([value, label]) => ({
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
            <Box ref={scrollRef} maxWidth={"1080px"} width={"100%"} m={"0 auto"} display={"flex"} flexDirection={"column"} gap={"32px"}>
              {isProject && totalPosts > POSTS_PER_PAGE && (
                <Typography variant="body1" textAlign={"right"} mr={"16px"}>
                  Số dự án: {totalFilterPosts}/{totalPosts}
                </Typography>
              )}

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
