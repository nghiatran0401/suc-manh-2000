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
import LoadingScreen from "../components/LoadingScreen";
import { StyledSelectComponent } from "../components/StyledComponent";
import MetaDecorator from "../components/MetaDecorater";
import { useSearchParams } from "react-router-dom";
import { publicLogoUrl } from "../constants";

import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";

export default function PostList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const filterParams = urlSearchParams.get("filter") || "{}";
  const searchParams = urlSearchParams.get("q") || "";

  const [loading, setLoading] = useState(false);
  const [filterValue, setFilterValue] = useState(() => JSON.parse(filterParams.replace(/(\w+):/g, '"$1":').replace(/:([^,}]+)/g, ':"$1"')));
  const [searchValue, setSearchValue] = useState(searchParams);
  const [posts, setPosts] = useState(undefined);
  const [classificationFilter, setClassificationFilter] = useState(filterValue.classificationFilter ? filterValue.classificationFilter : "all");
  const [totalFundFilter, setTotalFundFilter] = useState(filterValue.totalFundFilter ? filterValue.totalFundFilter : "all");
  const [statusFilter, setStatusFilter] = useState(filterValue.statusFilter ? filterValue.statusFilter : "all");

  const title = "Search page";
  const EXCLUDED_FILTER = ["phong-tin-hoc", "wc", "loai-khac"];

  useEffect(() => {
    if (searchParams) {
      fetchSearchData(searchParams);
    }
  }, []);

  // useEffect(() => {
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  //   setLoading(true);

  //   const ALL = "all";
  //   const filterObj = {};
  //   if (classificationFilter !== ALL || totalFundFilter !== ALL || statusFilter !== ALL) {
  //     if (classificationFilter !== ALL) filterObj.classificationFilter = classificationFilter;
  //     if (totalFundFilter !== ALL) filterObj.totalFundFilter = totalFundFilter;
  //     if (statusFilter !== ALL) filterObj.statusFilter = statusFilter;

  //     let filterString = JSON.stringify(filterObj);
  //     filterString = filterString.replace(/"(\w+)":/g, "$1:").replace(/:"([^"]+)"/g, ":$1");
  //     const queryString = "?filter=" + filterString;
  //     window.history.pushState({}, "", window.location.pathname + queryString);
  //   } else {
  //     window.history.pushState({}, "", window.location.pathname);
  //   }

  //   axios
  //     .get(SERVER_URL + "/" + category, {
  //       params: {
  //         _start: 0,
  //         _end: POSTS_PER_PAGE,
  //         filter: { classificationFilter, totalFundFilter, statusFilter },
  //       },
  //     })
  //     .then((posts) => {
  // setTotalPosts(Number(posts.headers["x-total-count"]));
  // setTotalFilterPosts(Number(posts.headers["x-total-filter-count"]));
  // setPosts(posts.data);
  // setHasMore(posts.data.length >= POSTS_PER_PAGE);
  // setLoading(false);
  //     })
  //     .catch((e) => console.error(e));
  // }, [category, classificationFilter, totalFundFilter, statusFilter]);

  const fetchSearchData = (value) => {
    setLoading(true);
    axios
      .get(SERVER_URL + "/search?q=" + value)
      .then((res) => {
        // setTotalFilterPosts(Number(posts.headers["x-total-filter-count"]));
        setPosts(res.data);
        setLoading(false);
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

        <Paper
          component="form"
          sx={{ p: "2px 4px", m: "0px auto", display: "flex", alignItems: "center", width: "100%" }}
          onSubmit={(e) => {
            e.preventDefault();
            fetchSearchData(searchValue);

            urlSearchParams.set("q", searchValue);
            setUrlSearchParams(urlSearchParams);
          }}
        >
          <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search" inputProps={{ "aria-label": "search" }} value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
          <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>

        {loading ? (
          <LinearProgress />
        ) : posts.length === 0 ? (
          <Typography variant="h6" textAlign={"center"}>
            Không tìm thấy dự án nào
          </Typography>
        ) : (
          <>
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
                Hiện có {posts.length} kết quả tìm kiếm cho "{searchParams}"
              </Typography>
            </>

            <Box maxWidth={"1080px"} width={"100%"} m={"0 auto"} display={"flex"} flexDirection={"column"} gap={"32px"}>
              <Grid container spacing={3} p={"16px"}>
                <CardList posts={posts} showDescription={false} />
              </Grid>
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
