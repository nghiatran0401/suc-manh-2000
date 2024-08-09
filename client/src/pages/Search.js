import React, { useState, useEffect } from "react";
import axios from "axios";
import { useMediaQuery, Box, LinearProgress, Typography, Grid, Pagination, Paper, InputBase, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { SERVER_URL, totalFundMapping, classificationMapping, statusMapping, DESKTOP_WIDTH, POSTS_PER_PAGE, categoryMapping } from "../constants";
import CardList from "../components/CardList";
import LoadingScreen from "../components/LoadingScreen";
import { StyledSelectComponent } from "../components/StyledComponent";
import { useSearchParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { provincesAndCities } from "../vietnam-provinces";
import FilterList from "../components/FilterList";

export default function PostList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const searchParams = urlSearchParams.get("q");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const count = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (page - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;

  const [searchValue, setSearchValue] = useState(searchParams);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [totalFundFilter, setTotalFundFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [provinceCount, setProvinceCount] = useState({});

  // for applying filters into url params
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    const category = urlSearchParams.get("categoryFilter");
    const classification = urlSearchParams.get("classificationFilter");
    const status = urlSearchParams.get("statusFilter");
    const totalFundFilter = urlSearchParams.get("totalFundFilter");
    const provinceFilter = urlSearchParams.get("provinceFilter");

    if (category) setCategoryFilter(category);
    if (classification) setClassificationFilter(classification);
    if (status) setStatusFilter(status);
    if (totalFundFilter) setTotalFundFilter(totalFundFilter);
    if (provinceFilter) setProvinceFilter(provinceFilter);
  }, [urlSearchParams]);

  // for fetching data from server with/without filters
  useEffect(() => {
    if (categoryFilter === "all") {
      urlSearchParams.delete("categoryFilter");
    } else if (categoryFilter) {
      urlSearchParams.set("categoryFilter", categoryFilter);
    }

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

    if (searchParams) {
      setSearchValue(searchParams);
      fetchSearchData();
    }
  }, [urlSearchParams, searchParams, categoryFilter, classificationFilter, totalFundFilter, statusFilter, provinceFilter]);

  const fetchSearchData = () => {
    setLoading(true);

    Promise.all([
      axios.get(SERVER_URL + window.location.pathname + window.location.search, { filters: { categoryFilter, classificationFilter, totalFundFilter, statusFilter, provinceFilter } }),
      axios.get(SERVER_URL + "/getClassificationAndCategoryCounts"),
    ])
      .then(([res1, res2]) => {
        setPosts(res1.data.filter((post) => post.redisKey.includes("du-an")));
        setProvinceCount(res2.data.province);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  };

  const onSearch = (e) => {
    e.preventDefault();
    fetchSearchData();

    urlSearchParams.set("q", searchValue);
    setUrlSearchParams(urlSearchParams);

    setCategoryFilter("all");
    setClassificationFilter("all");
    setTotalFundFilter("all");
    setStatusFilter("all");
    setProvinceFilter("all");

    urlSearchParams.delete("categoryFilter");
    urlSearchParams.delete("classificationFilter");
    urlSearchParams.delete("totalFundFilter");
    urlSearchParams.delete("statusFilter");
    urlSearchParams.delete("provinceFilter");
    setUrlSearchParams(urlSearchParams);
  };

  if (!posts || posts.length < 0) return <LoadingScreen />;
  return (
    <Box m={isMobile ? "24px 16px" : "88px auto"} display={"flex"} flexDirection={"column"} gap={"40px"} maxWidth={DESKTOP_WIDTH}>
      <Typography variant="h5" fontWeight="bold" color={"#000"} textAlign={"center"}>
        Trang Tìm Kiếm
      </Typography>

      <Paper
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
        <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search" inputProps={{ "aria-label": "search" }} value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
        <IconButton type="button" sx={{ p: "10px" }} aria-label="search" onClick={onSearch}>
          <SearchIcon />
        </IconButton>
      </Paper>

      <Box display={"flex"} flexDirection={"row"} flexWrap={"wrap"} justifyContent={isMobile ? "center" : "flex-end"} alignItems={"center"} gap={"16px"}>
        <FilterList
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
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
