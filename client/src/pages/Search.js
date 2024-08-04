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

  const EXCLUDED_FILTER = ["phong-tin-hoc", "wc", "loai-khac"];

  // for applying filters into url params
  useEffect(() => {
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
  }, []);

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
      fetchSearchData(searchParams);
    }
  }, [searchParams, categoryFilter, classificationFilter, totalFundFilter, statusFilter, provinceFilter]);

  const fetchSearchData = () => {
    setLoading(true);

    axios
      .get(SERVER_URL + window.location.pathname + window.location.search, { filters: { categoryFilter, classificationFilter, totalFundFilter, statusFilter, provinceFilter } })
      .then((res) => {
        setPosts(res.data.filter((post) => post.redisKey.includes("du-an")));
        setLoading(false);
      })
      .catch((e) => console.error(e));
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
        onSubmit={(e) => {
          e.preventDefault();
          fetchSearchData();

          urlSearchParams.set("q", searchValue);
          setUrlSearchParams(urlSearchParams);

          setClassificationFilter("all");
          setTotalFundFilter("all");
          setStatusFilter("all");
          setProvinceFilter("all");
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search"
          inputProps={{ "aria-label": "search" }}
          value={searchValue}
          onChange={(e) => {
            e.preventDefault();
            e.stopPropagation();

            setSearchValue(e.target.value);
          }}
        />
        <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
          <SearchIcon />
        </IconButton>
      </Paper>

      <Box display={"flex"} flexDirection={isMobile ? "column" : "row"} justifyContent={isMobile ? "center" : "flex-end"} alignItems={"center"} gap={"16px"}>
        <StyledSelectComponent
          label="Danh mục"
          inputWidth={200}
          isMobile={isMobile}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={[
            {
              label: "Tất cả",
              value: "all",
            },
            ...Object.entries(categoryMapping)
              .filter(([v, l]) => v.includes("du-an"))
              .map(([value, label]) => ({
                label,
                value,
              })),
          ]}
        />

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

        <StyledSelectComponent
          label="Tỉnh"
          inputWidth={200}
          isMobile={isMobile}
          value={provinceFilter}
          onChange={(e) => setProvinceFilter(e.target.value)}
          options={[
            {
              label: "Tất cả",
              value: "all",
            },
            ...provincesAndCities.map((i) => ({
              label: i.province,
              value: i.provinceValue,
            })),
          ]}
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
