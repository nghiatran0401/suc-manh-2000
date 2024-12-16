import { Box, Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import { DESKTOP_WIDTH } from "../constants";

export default function NttList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      </Grid>
    </Box>
  );
}