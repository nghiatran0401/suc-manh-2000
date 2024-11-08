import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useMediaQuery, Box, LinearProgress, Typography, Grid, Pagination, Paper, InputBase, IconButton, Chip, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { SERVER_URL, DESKTOP_WIDTH, POSTS_PER_PAGE, classificationMapping, EXCLUDED_FILTER, statusMapping, statusLogoMapping, statusColorMapping, statusColorHoverMapping } from "../constants";
import CardList from "../components/CardList";
import { useSearchParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import FilterList from "../components/FilterList";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import usePostFilter from "../hooks/usePostFilter";
import SortMenu from "../components/SortMenu";

export default function PostList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const searchParams = urlSearchParams.get("q") ? urlSearchParams.get("q") : "";

  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [statsData, setStatsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const count = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (page - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;

  const [searchValue, setSearchValue] = useState(searchParams);
  const { filters, setFilters } = usePostFilter();
  const [provinceCount, setProvinceCount] = useState({});
  const scrollRef = useRef(null);

  // get total stats data
  useEffect(() => {
    setLoading(true);
    axios
      .get(SERVER_URL + "/search", { params: { filters } })
      .then((postsResponse) => {
        setStatsData(postsResponse.data.stats);
        setTotalPosts(postsResponse.data.totalPosts);
        setProvinceCount(postsResponse.data.provinceCount);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, []);

  // for applying filters into url params
  useEffect(() => {
    const category = urlSearchParams.get("category");
    const classification = urlSearchParams.get("classification");
    const status = urlSearchParams.get("status");
    const totalFund = urlSearchParams.get("totalFund");
    const province = urlSearchParams.get("province");

    if (category) setFilters({ ...filters, category: category });
    if (status) setFilters({ ...filters, status: status });
    if (classification) setFilters({ ...filters, classification: classification });
    if (totalFund) setFilters({ ...filters, totalFund: totalFund });
    if (province) setFilters({ ...filters, province: province });
  }, [urlSearchParams]);

  // for fetching data from server with/without filters
  useEffect(() => {
    if (filters.category === "all") {
      urlSearchParams.delete("category");
    } else if (filters.category) {
      urlSearchParams.set("category", filters.category);
    }

    if (filters.classification === "all") {
      urlSearchParams.delete("classification");
    } else if (filters.classification) {
      urlSearchParams.set("classification", filters.classification);
    }

    if (filters.status === "all") {
      urlSearchParams.delete("status");
    } else if (filters.status) {
      urlSearchParams.set("status", filters.status);
    }

    if (filters.totalFund === "all") {
      urlSearchParams.delete("totalFund");
    } else if (filters.totalFund) {
      urlSearchParams.set("totalFund", filters.totalFund);
    }

    if (filters.province === "all") {
      urlSearchParams.delete("province");
    } else if (filters.province) {
      urlSearchParams.set("province", filters.province);
    }

    setUrlSearchParams(urlSearchParams);
    setSearchValue(searchParams);
    fetchSearchData();

    if (scrollRef.current && posts.length > 0) {
      window.scrollTo({
        top: scrollRef.current.offsetTop - 80,
        behavior: "smooth",
      });
    }
  }, [urlSearchParams, searchParams, filters]);

  const fetchSearchData = () => {
    setLoading(true);
    axios
      .get(SERVER_URL + window.location.pathname + window.location.search, { params: { filters } })
      .then((postsResponse) => {
        setPosts(postsResponse.data.posts);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  };

  const onSearch = (e) => {
    e.preventDefault();
    fetchSearchData();

    if (searchValue) {
      urlSearchParams.set("q", searchValue);
      setUrlSearchParams(urlSearchParams);
    } else {
      urlSearchParams.delete("q");
      setUrlSearchParams(urlSearchParams);
    }

    setFilters({ ...filters, category: "all", classification: "all", totalFund: "all", status: "all", province: "all" });

    urlSearchParams.delete("category");
    urlSearchParams.delete("classification");
    urlSearchParams.delete("totalFund");
    urlSearchParams.delete("status");
    urlSearchParams.delete("province");
    setUrlSearchParams(urlSearchParams);
  };

  return (
    <Box m={isMobile ? "24px 16px" : "24px auto"} display={"flex"} flexDirection={"column"} gap={"40px"} maxWidth={DESKTOP_WIDTH}>
      <Typography variant="h4" fontWeight="bold" color={"#000"} textAlign={"center"}>
        Tổng hợp tất cả Dự án
      </Typography>

      <Grid container display={"flex"} alignItems={"center"} justifyContent={"center"} gap={"16px"} borderRadius={"8px"}>
        <Box display={"flex"} flexDirection={isMobile ? "column" : "row"} textAlign={"center"} alignItems={"center"} gap={"16px"} m={"0 auto"}>
          <Box display="flex" flexDirection={"column"} alignItems={"center"} justifyContent={"center"} bgcolor={"#FFF1F0"} p={"32px 24px"} borderRadius={2} width={isMobile ? "90%" : "540px"} height={"230px"}>
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" color={"red"}>
              {Number(Object.values(statsData).reduce((acc, curr) => acc + curr["totalFund"], 0)).toLocaleString()} VNĐ
            </Typography>
            <Typography fontSize={"20px"} fontWeight={700} lineHeight={"28px"} color={"#000000E0"}>
              TỔNG SỐ TIỀN ĐÃ QUYÊN GÓP
            </Typography>
          </Box>

          <Box display="flex" flexDirection={"column"} alignItems={"center"} justifyContent={"center"} bgcolor={"#FFF1F0"} p={"16px"} borderRadius={2} width={isMobile ? "90%" : "540px"} height={"230px"}>
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" color={"red"}>
              {totalPosts}
            </Typography>
            <Typography fontSize={"20px"} fontWeight={700} lineHeight={"28px"} color={"#000000E0"}>
              TỔNG TẤT CẢ DỰ ÁN
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <Typography fontSize={"16px"} fontWeight={600} color={"#00000073"}>
                {Object.values(statsData).reduce((acc, curr) => acc + curr["dang-xay-dung"] + curr["da-hoan-thanh"], 0)} Dự án đã khởi công
              </Typography>
              <Typography fontSize={"16px"} fontWeight={600} color={"#00000073"}>
                {Object.values(statsData).reduce((acc, curr) => acc + curr["da-hoan-thanh"], 0)} Dự án đã hoàn thành
              </Typography>
              <Typography fontSize={"16px"} fontWeight={600} color={"#00000073"}>
                {Object.values(statsData).reduce((acc, curr) => acc + curr["dang-xay-dung"], 0)} Dự án đang xây dựng
              </Typography>
              <Typography fontSize={"16px"} fontWeight={600} color={"#00000073"}>
                {Object.values(statsData).reduce((acc, curr) => acc + curr["can-quyen-gop"], 0)} Dự án cần quyên góp
              </Typography>
            </Box>
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
          {statsData &&
            Object.keys(statsData).length > 0 &&
            Object.entries(classificationMapping)
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
                      {(statsData[value] ? statsData[value]["dang-xay-dung"] : 0) + (statsData[value] ? statsData[value]["da-hoan-thanh"] : 0)} Dự án khởi công
                    </Typography>
                    <Typography fontSize={isMobile ? "12px" : "14px"} fontWeight={600} color={"#00000073"} lineHeight={"16px"}>
                      {(Number(statsData[value] ? statsData[value]["totalFund"] : 0) / 1_000_000_000).toFixed(1).toLocaleString()} tỷ Tiền quyên góp
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
                          setFilters({ ...filters, classification: value, status: status, totalFund: "all", province: "all" });
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
                        setFilters({ ...filters, classification: value, status: "all", totalFund: "all", province: "all" });
                      }}
                    >
                      Tất cả
                    </Button>
                  </Box>
                </Grid>
              ))}
        </Grid>
      </Grid>

      <Paper
        ref={scrollRef}
        component="form"
        sx={{
          p: "2px 4px",
          m: "0px auto",
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
        onSubmit={onSearch}
      >
        <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Tìm kiếm theo tên Dự án" inputProps={{ "aria-label": "search" }} value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
        <IconButton type="button" sx={{ p: "10px" }} aria-label="search" onClick={onSearch}>
          <SearchIcon sx={{ color: "red" }} />
        </IconButton>
      </Paper>

      <Box display={"flex"} flexDirection={"row"} flexWrap={"wrap"} justifyContent={isMobile ? "center" : "flex-end"} alignItems={"center"} gap={"16px"}>
        <FilterList
          category={filters.category}
          setCategory={(value) => setFilters({ ...filters, category: value })}
          classification={filters.classification}
          setClassification={(value) => setFilters({ ...filters, classification: value })}
          totalFund={filters.totalFund}
          setTotalFund={(value) => setFilters({ ...filters, totalFund: value })}
          status={filters.status}
          setStatus={(value) => setFilters({ ...filters, status: value })}
          province={filters.province}
          setProvince={(value) => setFilters({ ...filters, province: value })}
          provinceCount={provinceCount}
        />
        <SortMenu/>
      </Box>

      <Typography variant="body1" textAlign={"right"} mr={"16px"}>
        Hiện có {posts.length} kết quả tìm kiếm
      </Typography>

      {loading ? (
        <LinearProgress />
      ) : posts.length === 0 ? (
        <Typography variant="h6" textAlign={"center"}>
          ----------
        </Typography>
      ) : (
        <Box maxWidth={DESKTOP_WIDTH} width={"100%"} m={"0 auto"} display={"flex"} flexDirection={"column"} gap={"32px"}>
          <Box maxWidth={DESKTOP_WIDTH} width={"100%"} m={"0 auto"} display={"flex"} flexDirection={"column"} gap={"32px"}>
            <Grid container spacing={3} p={"16px"}>
              <CardList posts={posts.slice(startIndex, endIndex)} />
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
                  top: 0,
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
