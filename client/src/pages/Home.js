import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography } from "@mui/material";
// components
import HeaderBar from "../components/Header";
import { SERVER_URL } from "../constants";
import CarouselMember from "../components/CarouselMember";
import Footer from "../components/Footer";
import Companion from "../components/Companion";

export default function Home() {
  const [testData, setTestData] = useState([]);

  useEffect(() => {
    axios
      .get(SERVER_URL)
      .then((res) => setTestData(res.data.data))
      .catch((e) => console.error(e));
  }, []);

  console.log("testData", testData);

  return (
    <div>
      <HeaderBar />
      <CarouselMember/>
      <Box display={"flex"} flexDirection={"column"} gap={"16px"} p={"40px"}>
        <Typography variant="h4" fontWeight="bold">
          Suc manh 2000
        </Typography>
        {testData?.length > 0 &&
          testData.map((d) => (
            <Typography>
              {d.post_type} - {d.post_title}
            </Typography>
          ))}
      </Box>
      <Companion/>
      <Footer />  
    </div>
  );
}
