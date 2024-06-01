import * as React from "react";
import { ReactTyped } from "react-typed";
import { Stack, Box } from "@mui/material";
import './config/styles.css';
import Logo from "../assets/logo-header.png";
export default function LoadingScreen() {
  function getRandomElement(array) {
    if (array.length === 0) {
      return [];
    }

    const randomIndex = Math.floor(Math.random() * array.length);
    return [array[randomIndex]];
  }

  return (
    <Box
      sx={{
        backgroundColor: "transparent",
        height: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack justifyContent={"center"} alignItems={"center"} maxWidth={"80%"} width={"800px"}>          
      <img src={Logo} className="rotating" style={{ height: 80 }} alt="loading" />
        {/* <div style={{marginTop:25}}>
          <ReactTyped
            strings={getRandomElement(["Đang tải dữ liệu...", "Vui lòng chờ trong giây lát..."])}
            typeSpeed={40}
            backSpeed={50}
            backDelay={1000}
            loop
            smartBackspace
          />
        </div> */}
      </Stack>
    </Box>
  );
}
