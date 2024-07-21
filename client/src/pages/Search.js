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
  const searchParams = urlSearchParams.get("q");

  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState(undefined);
  const [searchValue, setSearchValue] = useState(searchParams);
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [totalFundFilter, setTotalFundFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const title = "Search page";
  const EXCLUDED_FILTER = ["phong-tin-hoc", "wc", "loai-khac"];

  useEffect(() => {
    const status = urlSearchParams.get("filters[status]");
    const classification = urlSearchParams.get("filters[classification]");
    const totalFundMin = urlSearchParams.get("filters[totalFund][min]");
    const totalFundMax = urlSearchParams.get("filters[totalFund][max]");

    switch (status) {
      case "dahoanthanh":
        setStatusFilter("da-hoan-thanh");
        break;
      case "canquyengop":
        setStatusFilter("can-quyen-gop");
        break;
      case "dangxaydung":
        setStatusFilter("dang-xay-dung");
        break;
      default:
        break;
    }

    switch (classification) {
      case "truonghoc":
        setClassificationFilter("truong-hoc");
        break;
      case "nhahanhphuc":
        setClassificationFilter("nha-hanh-phuc");
        break;
      case "khunoitru":
        setClassificationFilter("khu-noi-tru");
        break;
      case "cauhanhphuc":
        setClassificationFilter("cau-hanh-phuc");
        break;
      case "phongtinhoc":
        setClassificationFilter("phong-tin-hoc");
        break;
      case "wc":
        setClassificationFilter("wc");
        break;
      case "loaikhac":
        setClassificationFilter("loai-khac");
        break;
      default:
        break;
    }

    if (totalFundMin && totalFundMax) {
      const min = parseInt(totalFundMin, 10) / 1000000;
      const max = parseInt(totalFundMax, 10) / 1000000;
      setTotalFundFilter(`${min}-to-${max}`);
    }
  }, []);

  useEffect(() => {
    const filters = {};
    if (classificationFilter === "all") {
      urlSearchParams.delete("filters[classification]");
    } else if (classificationFilter) {
      filters.classification = classificationFilter.replace(/-/g, "");
    }

    if (statusFilter === "all") {
      urlSearchParams.delete("filters[status]");
    } else if (statusFilter) {
      filters.status = statusFilter.replace(/-/g, "");
    }

    if (totalFundFilter === "all") {
      urlSearchParams.delete("filters[totalFund][min]");
      urlSearchParams.delete("filters[totalFund][max]");
    } else if (totalFundFilter) {
      const [min, max] = totalFundFilter.split("-to-");
      if (min && max) {
        const minAdjusted = parseInt(min, 10) * 1000000;
        const maxAdjusted = parseInt(max, 10) * 1000000;
        filters.totalFund = { min: minAdjusted, max: maxAdjusted };
      }
    }

    if (Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, value]) => {
        if (key === "totalFund" && typeof value === "object" && value.min && value.max) {
          urlSearchParams.set(`filters[${key}][min]`, value.min);
          urlSearchParams.set(`filters[${key}][max]`, value.max);
        } else {
          urlSearchParams.set(`filters[${key}]`, value);
        }
      });
    }
    setUrlSearchParams(urlSearchParams);

    if (searchParams) {
      fetchSearchData(searchParams);
    }
  }, [searchParams, classificationFilter, totalFundFilter, statusFilter]);

  const fetchSearchData = (value) => {
    setLoading(true);

    axios
      .get(SERVER_URL + window.location.pathname + window.location.search)
      .then((res) => {
        console.log("here", res.data);
        setPosts(res.data.filter((post) => post.redisKey.includes("du-an")));
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
            setClassificationFilter("all");
            setTotalFundFilter("all");
            setStatusFilter("all");
          }}
        >
          <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search" inputProps={{ "aria-label": "search" }} value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
          <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>

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
            Hiện có {posts.length} kết quả tìm kiếm cho "{urlSearchParams.get("q")}"
          </Typography>
        </>

        {loading ? (
          <LinearProgress />
        ) : posts.length === 0 ? (
          <Typography variant="h6" textAlign={"center"}>
            ----------
          </Typography>
        ) : (
          <>
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
