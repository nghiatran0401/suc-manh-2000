import * as React from "react";
import { ReactTyped } from "react-typed";
import { Stack, Box } from "@mui/material";

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
        <Box
          sx={{
            backgroundColor: "#FFF",
            padding: "24px",
            border: "1.5px solid #171717",
            borderRadius: " 24px 24px 0px 24px",
            fontSize: "32px",
          }}
        >
          <ReactTyped strings={getRandomElement(["Loading, just a sec..."])} typeSpeed={30} loop={false} />
        </Box>
      </Stack>
    </Box>
  );
}
