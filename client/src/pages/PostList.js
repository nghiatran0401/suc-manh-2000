import React, { useState, useEffect } from "react";
import axios from "axios";
import { useMediaQuery, Box, LinearProgress, Typography, Grid, Card, CardContent, Chip, Avatar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroller";
import { POSTS_PER_PAGE, SERVER_URL, HEADER_DROPDOWN_LIST, totalFundMapping, classificationMapping, statusMapping, statusColorMapping, statusLogoMapping } from "../constants";
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

export default function PostList() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParams = searchParams.get("filter") || "{}";
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [filterValue, setFilterValue] = useState(() => JSON.parse(filterParams.replace(/(\w+):/g, '"$1":').replace(/:([^,}]+)/g, ':"$1"')));
  const [posts, setPosts] = useState(undefined);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalFilterPosts, setTotalFilterPosts] = useState(0);
  const [classificationFilter, setClassificationFilter] = useState(filterValue.classificationFilter ? filterValue.classificationFilter : "all");
  const [totalFundFilter, setTotalFundFilter] = useState(filterValue.totalFundFilter ? filterValue.totalFundFilter : "all");
  const [statusFilter, setStatusFilter] = useState(filterValue.statusFilter ? filterValue.statusFilter : "all");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [statsData, setStatsData] = useState({});

  const isProject = category.includes("du-an") || category.includes("phong-tin-hoc");
  const title = ("Lưu trữ danh mục: " + findTitle(HEADER_DROPDOWN_LIST, "/" + category)).toUpperCase();
  const EXCLUDED_FILTER = ["phong-tin-hoc", "wc", "loai-khac"];

  useEffect(() => {
    axios
      .get(`${SERVER_URL}/${category}/stats`)
      .then((stats) => setStatsData(stats.data))
      .catch((e) => console.error(e));
  }, []);

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
      <MetaDecorator description={title} imageUrl={publicLogoUrl} />
      <HeaderBar />

      <Box m={isMobile ? "24px 16px" : "88px auto"} display={"flex"} flexDirection={"column"} gap={"40px"} maxWidth={"1080px"}>
        {title && (
          <Typography variant="h5" fontWeight="bold" color={"#000"} textAlign={"center"}>
            {title}
          </Typography>
        )}

        {loading ? (
          <LinearProgress />
        ) : posts.length === 0 ? (
          <Typography variant="h6" textAlign={"center"}>
            Không tìm thấy dự án nào
          </Typography>
        ) : (
          <>
            {isProject && (
              <Grid container display={"flex"} alignItems={"center"} gap={"16px"} m={"0 auto"} bgcolor={"#f2f2f2"} p={"32px"} borderRadius={"8px"}>
                <Box display={"flex"} flexDirection={"column"} textAlign={"center"} alignItems={"center"} gap={"16px"} m={"0 auto"}>
                  <Typography variant="h5" fontWeight="bold" color={"red"}>
                    Thống kê nhanh
                  </Typography>

                  <Box display={"flex"} gap={"8px"}>
                    <Typography variant="h6">Tổng dự án trong năm:</Typography>
                    <Typography variant="h5" fontWeight="bold" color={"red"}>
                      <CountUp start={0} end={totalPosts} duration={10} />
                    </Typography>
                  </Box>
                </Box>

                <Grid container item display={"flex"} flexWrap={"wrap"} spacing={2} width={"100%"}>
                  {Object.entries(classificationMapping)
                    .filter(([v, l]) => !EXCLUDED_FILTER.includes(v))
                    .map(([value, label]) => (
                      <Grid item xs={12} md={3} sm={6}>
                        <Card key={value} sx={{ paddingBottom: 0 }}>
                          <CardContent>
                            <Typography variant="body1" textAlign={"center"}>
                              {label}: {statsData[value]?.count ?? 0}
                            </Typography>

                            <Box style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "8px" }}>
                              {Object.keys(statusMapping).map((status) => (
                                <Chip
                                  variant="outline"
                                  avatar={<img src={statusLogoMapping[status]} alt="logo" />}
                                  label={statsData[value]?.[status] ?? 0}
                                  sx={{ backgroundColor: statusColorMapping[status] }}
                                  onClick={() => {
                                    setClassificationFilter(value);
                                    setStatusFilter(status);
                                  }}
                                />
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              </Grid>
            )}

            {isProject && totalPosts > POSTS_PER_PAGE && (
              <>
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

                <Typography variant="body1" textAlign={"right"} mr={"16px"}>
                  Số dự án: {totalFilterPosts}/{totalPosts}
                </Typography>
              </>
            )}

            <Box maxWidth={"1080px"} width={"100%"} m={"0 auto"} display={"flex"} flexDirection={"column"} gap={"32px"}>
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
