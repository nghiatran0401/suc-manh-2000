import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useMediaQuery, Box, Typography, Grid, Pagination, Chip, Button, Paper, Card, CardContent } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { SERVER_URL, DESKTOP_WIDTH, POSTS_PER_PAGE, classificationMapping, EXCLUDED_FILTER, statusMapping, statusLogoMapping, statusColorMapping, statusColorHoverMapping } from "../constants";
// import { useSearchParams } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import usePostFilter from "../hooks/usePostFilter";
import usePostSort from "../hooks/usePostSort";
import SearchBox from "../components/SearchBox";
import FilterList from "../components/FilterList";
import SortList from "../components/SortList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Sm2000Logo from "../assets/companions/SM2000.svg";
// import Carousel from "react-material-ui-carousel";


export default function Donor() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [donors, setDonors] = useState([]);
    const [totalDonors, setTotalDonors] = useState(0);
    const [totalPosts, setTotalPosts] = useState(0);
    const [statsData, setStatsData] = useState({});
    const [page, setPage] = useState(1);
    const count = Math.ceil(donors.length / POSTS_PER_PAGE);
    const startIndex = (page - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { filters, setFilters } = usePostFilter();
    const { sortField, setSortField } = usePostSort();
  
    const [provinceCount, setProvinceCount] = useState({});    
    const itemsPerSlide = 4;

    const chunkedDonors = [];
    for (let i = 0; i < donors.length; i += itemsPerSlide) {
      chunkedDonors.push(donors.slice(i, i + itemsPerSlide));
    }
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

    useEffect(() => {
        axios.get(`${SERVER_URL}/nha-tai-tro`)
          .then(response => {
            setDonors(response.data.donors);
            setTotalDonors(response.data.donors.length); 
          })
          .catch(error => {
            console.error("Lỗi khi lấy danh sách nhà tài trợ:", error);
          });
      }, []);

    return(
        <Box m={isMobile ? "24px 16px" : "24px auto"} display={"flex"} flexDirection={"column"} gap={"40px"} maxWidth={DESKTOP_WIDTH}>

            <Typography variant="h4" fontWeight="bold" color={"#000"} textAlign={"center"}>
            Thống kê nhanh
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
                        {totalDonors ?? 0}
                        </Typography>
                        <Typography fontSize={"20px"} fontWeight={700} lineHeight={"28px"} color={"#000000E0"}>
                        Tổng các nhà tài trợ
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
                                    setFilters({ ...filters, classification: value, status: status, totalFund: "all", province: "all", constructionUnit: "all" });
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
                                    setFilters({ ...filters, classification: value, status: "all", totalFund: "all", province: "all", constructionUnit: "all" });
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
                    constructionUnit: "all",
                    });
                    setSortField("createdAt");
                }}
                >
                Reset
                </Button>
            </Box>
            {/* donors grid */}
            <Grid container spacing={2} columns={16}>
                {donors.length === 0 ? (
                <Typography textAlign="center" width="100%">
                    Đang tải dữ liệu...
                </Typography>
                ) : (
                donors.slice(startIndex, endIndex).map((item) => (
                <Grid key={item.id} item xs={12} sm={6} md={4}>
                <Card
                sx={{
                    maxWidth: 300,
                    height: 350, 
                    padding: 2,
                    borderRadius: "12px",
                    boxShadow: 3,
                    position: "relative",

                }}
                >
                {/* Logo */}
                <Box sx={{ display: "flex" }}>
                    <img
                    src={item.logo || Sm2000Logo}
                    alt="Donor Logo"
                    style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    }}
                    />
                </Box>

                {/* Badge */}
                <Chip
                    label={item.type || "Khác"}
                    sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    color: "black",
                    fontWeight: "bold",
                    }}
                />

                <CardContent sx={{ textAlign: "start" }}>
                    <Typography
                        display="flex"
                        alignItems="center"
                        justifyContent="flex-start"
                        fontWeight={700}
                        sx={{
                            bgcolor: "white",
                            color: "#002C8C",
                            p: "4px 8px",
                            width: "fit-content",
                            border: "1px solid #91CAFF",
                            borderRadius: "16px",
                            display: "flex",
                            gap: 1,
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            display: "block",
                        }}
                            >
                        {Number(item.totalDonation).toLocaleString()} VNĐ
        
                    </Typography>
                    <Typography 
                    fontSize={16} fontWeight={700} mt={1} color="#000"
                    sx ={{
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        display: "block",
                    }}
                    >
                        {item.name}
                    </Typography>
                </CardContent>
                </Card>
            </Grid>
            
        ))
         )}
            </Grid>

            {/* Pagination for donors grid */}
            {count > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                    count={count}
                    page={page}
                    onChange={(event, value) => {
                    setPage(value);
                    window.scrollTo({ top: 0, behavior: "smooth" }); // Cuộn lên đầu khi đổi trang
                    }}
                    color="primary"
                    variant="outlined"
                    shape="rounded"
                />
            </Box>
            )}
        
            
            {/* Featured Sponsors Carousel*/}
            {/* <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textAlign: "center" }} >
                    Nhà tài trợ <span style={{ color: "#d32f2f", fontWeight: "bold" }}>tiêu biểu</span>
                </Typography>

                <Carousel
                    indicators={true}
                    navButtonsAlwaysVisible={true}
                    animation="slide"
                    duration={500}
                    navButtonsProps={{
                        style: {
                          backgroundColor: "transparent", 
                          color: "black", 
                          fontSize: "5rem", 
                          transform: "translateY(-50%)",
                          width: 100,
                          height: 100,                 
                      }}}
                    indicatorContainerProps={{
                        style: {
                            marginTop: "10px", // Điều chỉnh khoảng cách giữa dots và nội dung
                        },
                    }}
                    indicatorIconButtonProps={{
                        style: {
                            width: "20px", // Kéo dài theo chiều ngang
                            height: "6px", // Giữ nguyên chiều dọc
                            color: "#B0BEC5", // Màu dots mặc định (xám nhạt)
                            fontSize: "12px", // Kích thước dots
                        },
                    }}
                    activeIndicatorIconButtonProps={{
                        style: {
                            color: "#F5222D", 
                            transform: "scale(1.3)", 
                        },
                    }}
                >
                    {chunkedDonors.map((chunk, index) => (
                    <Grid container spacing={3} justifyContent="center" key={index} sx={{padding: "0 90px"}}>
                        {chunk.map((donor) => (
                        <Grid item xs={12} sm={6} md={3} key={donor.id} sx={{ margin: "30px 0" }}>
                            <Card sx={{ borderRadius: "12px", boxShadow: 3, width: "100%" }}>
                            <CardContent sx={{ textAlign: "center", p: 2 }}>
                                <Box display="flex" justifyContent="center" mb={1}>
                                <img
                                    src={donor.logo}
                                    alt={donor.name}
                                    style={{ width: "60px", height: "60px", borderRadius: "50%" }}
                                />
                                </Box>
                                <Typography variant="h6" fontWeight="bold">
                                {donor.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                {donor.type}
                                </Typography>
                                <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="error"
                                sx={{ mt: 1 }}
                                >
                                {donors.donation?.amount
                                ? `${donors.donation.amount.toLocaleString()} VND`
                                : "Chưa có thông tin"}                                
                                </Typography>
                                <Button size="small" sx={{ mt: 1, color: "#d32f2f", fontWeight: "bold" }}>
                                Xem thêm
                                </Button>
                            </CardContent>
                            </Card>
                        </Grid>
                        ))}
                    </Grid>
                    ))}
                </Carousel>
            </Box> */}

        </Box >

    );
}