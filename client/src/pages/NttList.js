import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
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

    </Box>
  );
}