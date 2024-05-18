import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography } from "@mui/material";
import Carousel from "react-multi-carousel";
import { SERVER_URL } from "../constants";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../firebase";

// components
import HeaderBar from "../components/Header";
import CarouselSlide from "../components/CarouselSlide";
import Footer from "../components/Footer";
import Companion from "../components/Companion";

const RESPONSIVE = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 1024 },
    items: 4,
    slidesToSlide: 4,
  },
  desktop: {
    breakpoint: { max: 1024, min: 800 },
    items: 3,
    slidesToSlide: 2,
  },
  tablet: {
    breakpoint: { max: 800, min: 464 },
    items: 2,
    slidesToSlide: 1,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1,
  },
};

export default function Home() {
  const [testData, setTestData] = useState([]);
  const [tab1ImagesExample, setTab1ImagesExample] = useState([]);

  useEffect(() => {
    axios
      .get(SERVER_URL)
      .then((res) => {
        const testData = res.data.data;
        setTestData(testData);

        const image_urls = testData[0].main_info.tab1.images;
        const promises = image_urls.map((imagePath) => {
          const imageRef = ref(storage, imagePath);
          return getDownloadURL(imageRef);
        });

        Promise.all(promises)
          .then((urls) => {
            console.log("here", urls);
            setTab1ImagesExample(urls);
          })
          .catch((error) => console.log(error));
      })
      .catch((e) => console.error(e));
  }, []);

  console.log("testData", testData);

  if (!testData || testData.length === 0) return <></>;

  const contents = testData[0].main_info.tab1.content?.split("\n");
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
          <Typography variant="h6" fontWeight="bold" dangerouslySetInnerHTML={{ __html: testData[0].title }} />
        </Box>
        <br />

        <Box display={"flex"} gap={"10px"}>
          <Typography variant="body1">Intro content:</Typography>
          <Typography variant="body1" dangerouslySetInnerHTML={{ __html: testData[0].main_info.intro.content }} />
        </Box>
        <br />

        <Box display={"flex"} gap={"10px"}>
          <Typography variant="body1">Tab 1 content formatted example:</Typography>
          <Typography variant="body1" dangerouslySetInnerHTML={{ __html: tab1ContentFormattedExample }} />
        </Box>
        <br />

        <Box display={"flex"} gap={"10px"}>
          <Typography variant="body1">Tab 1 images example:</Typography>

          {tab1ImagesExample ? tab1ImagesExample.map((image, index) => <img key={index} width={"100px"} height={"auto"} src={image} alt={`Slide ${index}`} />) : <p>Loading...</p>}
        </Box>
        <br />

        <Box display={"flex"} gap={"10px"}>
          <Typography variant="body1">Tab 2 content:</Typography>
          <Typography variant="body1" dangerouslySetInnerHTML={{ __html: testData[0].main_info.tab2.content }} />
        </Box>
        <br />

        <Box display={"flex"} gap={"10px"}>
          <Typography variant="body1">Tab 3 content:</Typography>
          <Typography variant="body1" dangerouslySetInnerHTML={{ __html: testData[0].main_info.tab3.content }} />
        </Box>
        <br />

        <Box display={"flex"} gap={"10px"}>
          <Typography variant="body1">Sub info content:</Typography>
          <Typography variant="body1" dangerouslySetInnerHTML={{ __html: testData[0].sub_info.replace(/\n/g, "<br>") }} />{" "}
        </Box>
        <br />

        <pre>{JSON.stringify(testData[0], null, 2)}</pre>
      </Box>

      {/* <Companion /> */}
      {/* <Footer /> */}
    </Box>
  );
}
