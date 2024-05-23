import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography } from "@mui/material";
import { SERVER_URL } from "../constants";

// components
import HeaderBar from "../components/Header";
import CarouselSlide from "../components/CarouselSlide";
import Footer from "../components/Footer";
import Companion from "../components/Companion";

export default function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get(SERVER_URL)
      .then((res) => setData(data))
      .catch((e) => console.error(e));
  }, []);

  console.log("data", data);

  if (!data || data.length === 0) return <></>;

  const contents = data[0].main_info.tab1.content?.split("\n");
  let formattedContents = [];

  for (let content of contents) {
    if (content.includes("-")) {
      formattedContents.push(content.replace(/-(.*?)(?=\n|<br>|$)/g, "<li>$1</li>"));
    } else {
      formattedContents.push(`<br/>${content}`);
    }
  }

  const tab1ContentFormattedExample = `<ul>${formattedContents.join("")}</ul>`;

  return (
    <Box maxWidth={"1280px"} margin={"auto"}>
      {/* <HeaderBar /> */}
      {/* <CarouselSlide/> */}

      <Box display={"flex"} flexDirection={"column"} gap={"16px"} p={"40px"}>
        <Typography variant="h4" fontWeight="bold">
          Suc manh 2000
        </Typography>

        <Box display={"flex"} gap={"10px"}>
          <Typography variant="h6" fontWeight="bold">
            Title:
          </Typography>
          <Typography variant="h6" fontWeight="bold" dangerouslySetInnerHTML={{ __html: data[0].title }} />
        </Box>
        <br />

        <Box display={"flex"} gap={"10px"}>
          <Typography variant="body1">Intro content:</Typography>
          <Typography variant="body1" dangerouslySetInnerHTML={{ __html: data[0].main_info.intro.content }} />
        </Box>
        <br />

        <Box display={"flex"} gap={"10px"}>
          <Typography variant="body1">Tab 1 content formatted example:</Typography>
          <Typography variant="body1" dangerouslySetInnerHTML={{ __html: tab1ContentFormattedExample }} />
        </Box>
        <br />

        <Box display={"flex"} gap={"10px"}>
          <Typography variant="body1">Tab 1 images example:</Typography>
          {/* 
          {tab1ImagesExample ? tab1ImagesExample.map((image, index) => <img key={index} width={"100px"} height={"auto"} src={image} alt={`Slide ${index}`} />) : <p>Loading...</p>} */}
        </Box>
        <br />

        <Box display={"flex"} gap={"10px"}>
          <Typography variant="body1">Tab 2 content:</Typography>
          <Typography variant="body1" dangerouslySetInnerHTML={{ __html: data[0].main_info.tab2.content }} />
        </Box>
        <br />

        <Box display={"flex"} gap={"10px"}>
          <Typography variant="body1">Tab 3 content:</Typography>
          <Typography variant="body1" dangerouslySetInnerHTML={{ __html: data[0].main_info.tab3.content }} />
        </Box>
        <br />

        <Box display={"flex"} gap={"10px"}>
          <Typography variant="body1">Sub info content:</Typography>
          <Typography variant="body1" dangerouslySetInnerHTML={{ __html: data[0].sub_info.replace(/\n/g, "<br>") }} />{" "}
        </Box>
        <br />

        <pre>{JSON.stringify(data[0], null, 2)}</pre>
      </Box>

      {/* <Companion /> */}
      {/* <Footer /> */}
    </Box>
  );
}
