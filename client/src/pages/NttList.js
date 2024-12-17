import React, { useRef } from "react";
import { Box, Button, Chip, Grid, Pagination, Typography, useMediaQuery, useTheme } from "@mui/material";
import { DESKTOP_WIDTH } from "../constants";
import ArrowForward from "@mui/icons-material/ArrowForward";
import SearchBox from "../components/SearchBox";
import FilterList from "../components/FilterList";
import SortList from "../components/SortList";

export default function NttList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const scrollRef = useRef(null);

  return (
    <Box 
      m={isMobile ? "24px 16px" : "24px auto"} 
      display={"flex"} 
      flexDirection={"column"}
      gap={"24px"}
      maxWidth={DESKTOP_WIDTH}>

      <Typography
        variant="h4"
        fontWeight="bold"
        color={"#000"}
        textAlign={"center"}>
          Thống kê nhanh
      </Typography>

      <Grid container display={"flex"} alignItems={"center"} justifyContent={"center"} gap={"16px"} borderRadius={"8px"}>
        <Box display={"flex"} flexDirection={isMobile ? "column" : "row"} textAlign={"center"} gap={"16px"} m={"0 auto"}>
          <Box display="flex" flexDirection={"column"} alignItems={"center"} justifyContent={"center"} bgcolor={"#FFF1F0"} p={"32px 24px"} borderRadius={2} width={isMobile ? "90%" : "540px"} height={"230px"}>
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight={"bold"} lineHeight={"66px"} color={"red"}>
              {/** TODO: Fetch real data */}
              47,627,000,000 VND
            </Typography>
            <Typography fontSize={"24px"} fontWeight={700} lineHeight={"28px"} color={"#000000E0"}>
                SỐ TIỀN ĐÃ QUYÊN GÓP
            </Typography>
          </Box>

          <Box display="flex" flexDirection={"column"} alignItems={"center"} justifyContent={"center"} bgcolor={"#FFF1F0"} p={"32px 24px"} borderRadius={2} width={isMobile ? "90%" : "540px"} height={"230px"}>
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight={"bold"} lineHeight={"66px"} color={"red"}>
              {/** TODO: Fetch real data */}
              177
            </Typography>
            <Typography fontSize={"20px"} fontWeight={700} lineHeight={"28px"} color={"#000000E0"}>
              TỔNG CÁC NHÀ TÀI TRỢ
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
            display: "flex"
          }}>
          
          <Grid
            item
            display={"flex"}
            flexDirection={"column"}
            gap={"16px"}
            md={3}
            sm={6}
            xs={6}
            paddingTop={0}
            paddingRight={2}
          >
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"} gap={"4px"}>
              <Typography variant="h5" fontWeight={600}>
                69
              </Typography>
              <Typography variant="body1">Trường học</Typography>
              <Typography fontSize={isMobile ? "12px" : "14px"} fontWeight={600} color={"#00000073"} lineHeight={"16px"}>
                44/69 Dự án đã khởi công
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: isMobile ? "2px" : "8px",
                justifyContent: "center"
              }}
            >
              <Chip
                variant="outline"
                avatar={<img alt="logo"/>}
                sx={{
                  backgroundColor: "",
                  height: "24px",
                  "& .MuiChip-avatar": {
                    width: "16px",
                    height: "16px",
                  },
                  "&:hover": {
                  },
                }}
              />
            </Box>

            <Box 
              display="flex" 
              justifyContent="center" 
              width="100%" 
              height={"32px"}>
                <Button
                  variant="outlined"
                  sx={{ width: "100%", textTransform: "none", color: "#000", borderColor: "#D9D9D9", borderRadius: "32px", m: isMobile ? "0px" : "0px 16px" }}
                  endIcon={<ArrowForward />}
                >
                  Xem tất cả
                </Button>
            </Box>
          </Grid>
        </Grid>
      </Grid>

      {/* Search/Filter/Sort */}
      <Box 
        ref={scrollRef} 
        display={"flex"} 
        flexWrap={"wrap"} 
        justifyContent={"flex-end"} 
        alignItems={"center"} 
        gap={"16px"}>
          <SearchBox 
            inputProps={{ 
              width: isMobile ? "100%" : "30%", 
              height: isMobile ? "50px" : "40px" 
            }} />
          {/* <FilterList /> */}
          <SortList />
      </Box>

      <Box maxWidth={DESKTOP_WIDTH} width={"100%"} m={"0 auto"} display={"flex"} flexDirection={"column"} gap={"32px"}>
          <Typography variant="body1" textAlign={"left"}>
            Hiển thị 3 kết quả tìm kiếm
          </Typography>

          <Grid container spacing={3}>
            {/* <CardList /> */}
          </Grid>

          <Box display="flex" justifyContent="center">
            <Pagination
              color="primary"
              variant="outlined"
              shape="rounded"
            />
          </Box>
        </Box>
    </Box>
  );
}