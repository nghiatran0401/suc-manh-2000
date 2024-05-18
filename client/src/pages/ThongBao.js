import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Avatar, Grid } from "@mui/material";
import { MEMBERS, SERVER_URL } from "../constants";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../firebase";
import HeaderBar from "../components/Header";
import EventIcon from "@mui/icons-material/Event";
import CarouselSlide from "../components/CarouselSlide";
import Companion from "../components/Companion";
import Footer from "../components/Footer";
import CarouselMembers from "../components/CarouselMembers";

export default function ThongBao() {
  const [testData, setTestData] = useState([]);
  const [tab1ImagesExample, setTab1ImagesExample] = useState([]);

  useEffect(() => {
    axios
      .get(SERVER_URL + "/thong-bao")
      .then((res) => {
        const testData = res.data.data;
        setTestData(testData);

        const tabs = testData[6].content.tabs;
        const promises = tabs.map((tab) => {
          return tab.slide_show.map((slide) => {
            const imageRef = ref(storage, slide.image);
            return getDownloadURL(imageRef).then((url) => {
              return { image: url, caption: slide.caption };
            });
          });
        });

        Promise.all(promises.flat())
          .then((imageObjects) => {
            setTab1ImagesExample(imageObjects);
          })
          .catch((error) => console.log(error));
      })
      .catch((e) => console.error(e));
  }, []);

  console.log("testData", testData);

  function convertToEmbedUrl(url) {
    const videoId = url.split("v=")[1];
    const ampersandPosition = videoId.indexOf("&");
    if (ampersandPosition !== -1) {
      videoId = videoId.substring(0, ampersandPosition);
    }
    return `https://www.youtube.com/embed/${videoId}`;
  }

  if (!testData || testData.length === 0) return <></>;
  return (
    <Box>
      <HeaderBar />

      <Box maxWidth={"1080px"} m={"auto"} display={"flex"} flexDirection={"column"} gap={"16px"}>
        <Box display={"flex"} flexDirection={"column"} gap={"8px"} m={"24px auto"}>
          <Typography variant="h4" dangerouslySetInnerHTML={{ __html: testData[6].name }} />
          <Box display={"flex"} gap={"24px"}>
            <Box display={"flex"} alignItems={"center"} gap={"8px"}>
              <Avatar sx={{ width: 24, height: 24 }}>{testData[6].author.charAt(0)}</Avatar>
              <Typography variant="body2" dangerouslySetInnerHTML={{ __html: testData[6].author }} />
            </Box>
            <Box display={"flex"} alignItems={"center"} gap={"8px"}>
              <EventIcon sx={{ width: 24, height: 24 }} />
              <Typography variant="body2" dangerouslySetInnerHTML={{ __html: testData[6].publish_date.split(" ")[0] }} />{" "}
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={8}>
            <Box>
              <Box display={"flex"} gap={"10px"}>
                {testData[6].content.tabs.map((tab, index) => (
                  <Box display={"flex"} flexDirection={"column"} gap={"16px"}>
                    <Typography key={index} variant="body1" dangerouslySetInnerHTML={{ __html: tab.description }} />

                    {tab.embedded_url && (
                      <iframe
                        width="100%"
                        height="500"
                        src={convertToEmbedUrl(tab.embedded_url)}
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                      />
                    )}
                  </Box>
                ))}
              </Box>

              {tab1ImagesExample?.length > 0 && <CarouselSlide items={tab1ImagesExample} />}
            </Box>
          </Grid>

          <Grid item xs={4}>
            <Box display={"flex"} flexDirection={"column"} gap={"16px"}>
              <Typography variant="h6" fontWeight={"bold"}>
                BÀI VIẾT MỚI NHẤT
              </Typography>
              <Typography variant="h6">-----</Typography>
              {testData.slice(0, 5).map((post, index) => (
                <Box display={"flex"} gap={"8px"} alignItems={"center"} key={index} height={"56px"}>
                  <Avatar variant="rounded">{testData[6].author.charAt(0)}</Avatar>
                  <Typography variant="body2" dangerouslySetInnerHTML={{ __html: post.name }} />
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <CarouselMembers />
      <Companion />
      <Footer />
    </Box>
  );
}
