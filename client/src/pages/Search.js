import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useMediaQuery, Box, LinearProgress, Typography, Grid, Pagination, Chip, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { SERVER_URL, DESKTOP_WIDTH, POSTS_PER_PAGE, classificationMapping, EXCLUDED_FILTER, statusMapping, statusLogoMapping, statusColorMapping, statusColorHoverMapping } from "../constants";
import CardList from "../components/CardList";
import { useSearchParams } from "react-router-dom";
import FilterList from "../components/FilterList";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import usePostFilter from "../hooks/usePostFilter";
import SortList from "../components/SortList";
import usePostSort from "../hooks/usePostSort";
import SearchBox from "../components/SearchBox";
import Fuse from "fuse.js";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export default function Search() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  const [searchedPosts, setSearchedPosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [statsData, setStatsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const count = Math.ceil(searchedPosts.length / POSTS_PER_PAGE);
  const startIndex = (page - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;

  const [searchQuery, setSearchQuery] = useState("");
  const { filters, setFilters } = usePostFilter();
  const { sortField, setSortField } = usePostSort();

  const [provinceCount, setProvinceCount] = useState({});
  const scrollRef = useRef(null);

  // remain the same statistics data during reloads
  useEffect(() => {
    setLoading(true);
    axios
      .get(SERVER_URL + "/search", { params: { filters, sortField } })
      .then((postsResponse) => {
        setTotalPosts(postsResponse.data.totalPosts);
        setStatsData(postsResponse.data.stats);
        setProvinceCount(postsResponse.data.provinceCount);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, []);

  // apply url params into search/filter/sort
  useEffect(() => {
    const searchValue = urlSearchParams.get("q");
    const category = urlSearchParams.get("category");
    const status = urlSearchParams.get("status");
    const classification = urlSearchParams.get("classification");
    const totalFund = urlSearchParams.get("totalFund");
    const province = urlSearchParams.get("province");
    const sortField = urlSearchParams.get("sortField");

    if (searchValue) setSearchQuery(searchValue ?? "");
    if (category) setFilters((prevFilters) => ({ ...prevFilters, category }));
    if (status) setFilters((prevFilters) => ({ ...prevFilters, status }));
    if (classification) setFilters((prevFilters) => ({ ...prevFilters, classification }));
    if (totalFund) setFilters((prevFilters) => ({ ...prevFilters, totalFund }));
    if (province) setFilters((prevFilters) => ({ ...prevFilters, province }));
    if (sortField) setSortField(sortField);
  }, [urlSearchParams]);

  // fetch data from server with/without search/filter/sort
  useEffect(() => {
    const newUrlSearchParams = new URLSearchParams();
    if (filters.category && filters.category !== "all") {
      newUrlSearchParams.set("category", filters.category);
    }
    if (filters.classification && filters.classification !== "all") {
      newUrlSearchParams.set("classification", filters.classification);
    }
    if (filters.status && filters.status !== "all") {
      newUrlSearchParams.set("status", filters.status);
    }
    if (filters.totalFund && filters.totalFund !== "all") {
      newUrlSearchParams.set("totalFund", filters.totalFund);
    }
    if (filters.province && filters.province !== "all") {
      newUrlSearchParams.set("province", filters.province);
    }
    if (sortField && sortField !== "createdAt") {
      newUrlSearchParams.set("sortField", sortField);
    }
    if (newUrlSearchParams.toString() !== urlSearchParams.toString()) {
      setUrlSearchParams(newUrlSearchParams);
    }

    setLoading(true);
    axios
      .get(SERVER_URL + "/search", { params: { filters, sortField } })
      .then((postsResponse) => {
        // onSearch
        if (searchQuery !== "") {
          const fuseOptions = {
            isCaseSensitive: true,
            includeScore: true,
            shouldSort: true,
            // includeMatches: false,
            // findAllMatches: true,
            // minMatchCharLength: 1,
            // location: 0,
            threshold: 0.5,
            // distance: 100,
            useExtendedSearch: true,
            ignoreLocation: true,
            // ignoreFieldNorm: false,
            // fieldNormWeight: 1,
            keys: ["name", "cleanedName"],
          };
          const fuse = new Fuse(postsResponse.data.posts, fuseOptions);
          const results = fuse.search(searchQuery);
          const filteredResults = results.filter((result) => result.score <= 0.5).map((result) => result.item);
          setPosts(postsResponse.data.posts);
          setSearchedPosts(filteredResults);
        } else {
          setPosts(postsResponse.data.posts);
          setSearchedPosts(postsResponse.data.posts);
        }
        setLoading(false);
      })
      .catch((e) => console.error(e));

    if (scrollRef.current && posts.length > 0) {
      window.scrollTo({
        top: scrollRef.current.offsetTop - 80,
        behavior: "smooth",
      });
    }
  }, [searchQuery, filters, sortField, urlSearchParams]);

  return (
    <Box m={isMobile ? "24px 16px" : "24px auto"} display={"flex"} flexDirection={"column"} gap={"40px"} maxWidth={DESKTOP_WIDTH}>
      <Typography variant="h4" fontWeight="bold" color={"#000"} textAlign={"center"}>
        Tổng hợp tất cả Dự án
      </Typography>

      {/* Statistics */}
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
                          setSearchQuery("");
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
                        setSearchQuery("");
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

      {/* Search/Filter/Sort */}
      <Box display={"flex"} flexWrap={"wrap"} justifyContent={"flex-end"} alignItems={"center"} gap={"16px"}>
        <SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} inputProps={{ width: "100%", height: "50px" }} />
        <FilterList searchQuery={searchQuery} filters={filters} setFilters={setFilters} provinceCount={provinceCount} />
        <SortList searchQuery={searchQuery} sortField={sortField} setSortField={setSortField} />
        <Button
          variant="outlined"
          sx={{ textTransform: "none" }}
          endIcon={<RestartAltIcon />}
          onClick={() => {
            setSearchQuery("");
            setFilters({
              category: "all",
              classification: "all",
              totalFund: "all",
              status: "all",
              province: "all",
            });
            setSortField("createdAt");
          }}
        >
          Reset
        </Button>
      </Box>

      <Typography variant="body1" textAlign={"right"}>
        Hiện có {searchedPosts.length} kết quả tìm kiếm
      </Typography>

      {loading ? (
        <LinearProgress />
      ) : searchedPosts.length === 0 ? (
        <Typography variant="h6" textAlign={"center"} height={"300px"}>
          ----------
        </Typography>
      ) : (
        <Box maxWidth={DESKTOP_WIDTH} width={"100%"} m={"0 auto"} display={"flex"} flexDirection={"column"} gap={"32px"}>
          <Grid container spacing={3}>
            <CardList posts={searchedPosts.slice(startIndex, endIndex)} />
          </Grid>

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
