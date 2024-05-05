import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography } from "@mui/material";
import { SERVER_URL } from "../constants";

export default function DuAn2024() {
  return (
    <Box display={"flex"} flexDirection={"column"} gap={"16px"} p={"40px"}>
      <Typography variant="h4" fontWeight="bold">
        Du an 2024 page
      </Typography>
    </Box>
  );
}
