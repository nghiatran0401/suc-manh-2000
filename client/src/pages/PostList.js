import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useMediaQuery, Box, LinearProgress, Typography, Grid, Chip, Button, Pagination } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import { POSTS_PER_PAGE, SERVER_URL, HEADER_DROPDOWN_LIST, classificationMapping, statusMapping, statusColorMapping, statusLogoMapping, statusColorHoverMapping, DESKTOP_WIDTH } from "../constants";
import CardList from "../components/CardList";
import { findTitle } from "../helpers";
import LoadingScreen from "../components/LoadingScreen";
import CountUp from "react-countup";
import { useSearchParams } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FilterList from "../components/FilterList";

export default function PostList() {
  const { category } = useParams();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [statsData, setStatsData] = useState({});
  const [provinceCount, setProvinceCount] = useState({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const count = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (page - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;

  const [classificationFilter, setClassificationFilter] = useState("all");
  const [totalFundFilter, setTotalFundFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");

  const scrollRef = useRef(null);

  const isProject = category.includes("du-an");
  const title = findTitle(HEADER_DROPDOWN_LIST, "/" + category);
  const EXCLUDED_FILTER = ["phong-tin-hoc", "wc", "loai-khac"];

  // for applying filters into url params
  useEffect(() => {
    const status = urlSearchParams.get("statusFilter");
    const classification = urlSearchParams.get("classificationFilter");
    const totalFundFilter = urlSearchParams.get("totalFundFilter");
    const provinceFilter = urlSearchParams.get("provinceFilter");

    if (status) setStatusFilter(status);
    if (classification) setClassificationFilter(classification);
    if (totalFundFilter) setTotalFundFilter(totalFundFilter);
    if (provinceFilter) setProvinceFilter(provinceFilter);
  }, [urlSearchParams]);

  // for scrolling to top when there is no filter
  useEffect(() => {
    const status = urlSearchParams.get("statusFilter");
    const classification = urlSearchParams.get("classificationFilter");
    const totalFundFilter = urlSearchParams.get("totalFundFilter");
    const provinceFilter = urlSearchParams.get("provinceFilter");
    const isScrolling = !(status || classification || totalFundFilter || provinceFilter);

    const timer = setTimeout(() => {
      if (scrollRef.current && isScrolling) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [loading, urlSearchParams]);

  // for fetching data from server with/without filters
  useEffect(() => {
    setLoading(true);

    if (classificationFilter === "all") {
      urlSearchParams.delete("classificationFilter");
    } else if (classificationFilter) {
      urlSearchParams.set("classificationFilter", classificationFilter);
    }

    if (statusFilter === "all") {
      urlSearchParams.delete("statusFilter");
    } else if (statusFilter) {
      urlSearchParams.set("statusFilter", statusFilter);
    }

    if (totalFundFilter === "all") {
      urlSearchParams.delete("totalFundFilter");
    } else if (totalFundFilter) {
      urlSearchParams.set("totalFundFilter", totalFundFilter);
    }

    if (provinceFilter === "all") {
      urlSearchParams.delete("provinceFilter");
    } else if (provinceFilter) {
      urlSearchParams.set("provinceFilter", provinceFilter);
    }

    setUrlSearchParams(urlSearchParams);
    if (scrollRef.current) {
      window.scrollTo({
        top: scrollRef.current.offsetTop - 80,
        behavior: "smooth",
      });
    }

    Promise.all([
      axios.get(SERVER_URL + "/" + category, {
        params: {
          filters: {
            classification: classificationFilter,
            totalFund: totalFundFilter,
            status: statusFilter,
            province: provinceFilter,
          },
        },
      }),
      axios.get(SERVER_URL + "/getClassificationAndCategoryCounts"),
    ])
      .then(([postsResponse, countsResponse]) => {
        setPosts(postsResponse.data.posts);
        setTotalPosts(postsResponse.data.totalPosts);
        setStatsData(postsResponse.data.stats);
        setProvinceCount(countsResponse.data.province);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error.message);
      });
  }, [urlSearchParams, category, classificationFilter, totalFundFilter, statusFilter, provinceFilter]);

  if (!posts || !statsData) return <LoadingScreen />;
  return (
    <Box m={isMobile ? "24px 16px" : "88px auto"} display={"flex"} flexDirection={"column"} gap={"24px"} maxWidth={DESKTOP_WIDTH}>
      <Typography variant="h4" fontWeight="bold" color={"#000"} textAlign={"center"}>
        {title}
      </Typography>

      {/* Statistics */}
      {isProject && (
        <Grid container display={"flex"} alignItems={"center"} justifyContent={"center"} gap={"16px"} borderRadius={"8px"}>
          <Box display={"flex"} flexDirection={"column"} textAlign={"center"} alignItems={"center"} gap={"16px"} m={"0 auto"}>
            <Box bgcolor={"#FFF1F0"} p={6} borderRadius={2}>
              <Typography variant="h3" fontWeight="bold" color={"red"}>
                <CountUp start={0} end={totalPosts} duration={10} />
              </Typography>
              <Typography fontSize={"20px"} fontWeight={700} lineHeight={"28px"} color={"#000000E0"}>
                DỰ ÁN TRONG NĂM
              </Typography>
              <Typography fontSize={"16px"} fontWeight={600} color={"#00000073"}>
                {Object.values(statsData).reduce((acc, curr) => acc + curr["dang-xay-dung"] + curr["da-hoan-thanh"], 0)}/{totalPosts} Dự án khởi công
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
                <Grid
                  key={index}
                  item
                  display={"flex"}
                  flexDirection={"column"}
                  gap={"16px"}
                  md={3}
                  sm={6}
                  xs={6}
                  paddingTop={0}
                  paddingRight={2}
                  borderRight={index === 3 || (isMobile && index === 1) ? "" : "2px solid #D9D9D9"}
                >
                  <Box display={"flex"} flexDirection={"column"} alignItems={"center"} gap={"4px"}>
                    <Typography variant="h5" fontWeight={600}>
                      {statsData[value]?.count ?? 0}
                    </Typography>
                    <Typography variant="body1">{label}</Typography>
                    <Typography fontSize={isMobile ? "12px" : "14px"} fontWeight={600} color={"#00000073"} lineHeight={"16px"}>
                      {(statsData[value] ? statsData[value]["dang-xay-dung"] : 0) + (statsData[value] ? statsData[value]["da-hoan-thanh"] : 0)}/{statsData[value]?.count ?? 0} Dự án khởi công
                    </Typography>
                  </Box>

                  <Box
                    style={{
                      display: "flex",
                      gap: isMobile ? "2px" : "8px",
                      justifyContent: "center",
                    }}
                  >
                    {Object.keys(statusMapping).map((status, idx) => (
                      <Chip
                        key={idx}
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
                          setProvinceFilter("all");
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
                        setProvinceFilter("all");
                      }}
                    >
                      Tất cả
                    </Button>
                  </Box>
                </Grid>
              ))}
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      {isProject && (
        <Box display={"flex"} flexDirection={"row"} flexWrap={"wrap"} justifyContent={isMobile ? "center" : "flex-end"} alignItems={"center"} gap={"16px"}>
          <FilterList
            classificationFilter={classificationFilter}
            setClassificationFilter={setClassificationFilter}
            totalFundFilter={totalFundFilter}
            setTotalFundFilter={setTotalFundFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            provinceFilter={provinceFilter}
            setProvinceFilter={setProvinceFilter}
            provinceCount={provinceCount}
          />
        </Box>
      )}

      {loading ? (
        <LinearProgress />
      ) : (
        <Box maxWidth={DESKTOP_WIDTH} width={"100%"} m={"0 auto"} display={"flex"} flexDirection={"column"} gap={"32px"}>
          {isProject && (
            <Typography variant="body1" textAlign={"right"} mr={"16px"}>
              Số dự án: {posts.length}/{totalPosts}
            </Typography>
          )}

          {posts.length === 0 && (
            <Typography variant="h6" textAlign={"center"}>
              Không tìm thấy dự án nào
            </Typography>
          )}

          <Box maxWidth={DESKTOP_WIDTH} width={"100%"} m={"0 auto"} display={"flex"} flexDirection={"column"} gap={"32px"}>
            <Grid container spacing={3} p={"16px"}>
              <CardList posts={posts.slice(startIndex, endIndex)} showDescription={false} />
            </Grid>
          </Box>

          <Box display="flex" justifyContent="center">
            <Pagination
              color="primary"
              variant="outlined"
              shape="rounded"
              count={count}
              page={page}
              onChange={(e, page) => {
                setPage(page);
                window.scrollTo({
                  top: scrollRef.current.offsetTop - 80,
                  behavior: "smooth",
                });
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
