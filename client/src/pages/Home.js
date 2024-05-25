import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Grid, Card, Link, CardContent, Avatar } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { HEADER_DROPDOWN_LIST, POSTS_PER_PAGE, SERVER_URL } from "../constants";
import HeaderBar from "../components/Header";
import Footer from "../components/Footer";
import Companion from "../components/Companion";
import CarouselMembers from "../components/CarouselMembers";
import CarouselSlide from "../components/CarouselSlide";
import CardList from "../components/CardList";

const PROJECT_LIST = HEADER_DROPDOWN_LIST.find((item) => item.name === "du-an");

export default function Home() {
  const [news, setNews] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectTab, setProjectTab] = useState("/du-an-2024");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(SERVER_URL + "/thong-bao" + "/getLatestPosts")
      .then((news) => {
        setNews(news.data.data);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    setLoading(true);
    axios
      .get(SERVER_URL + projectTab, { params: { page: 1, postsPerPage: 8 } })
      .then((projects) => {
        setProjects(projects.data.data);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [projectTab]);

  console.log("home", { news, projects });

  if (Object.keys(news).length <= 0 || Object.keys(projects).length <= 0) return <></>;
  return (
    <Box>
      <HeaderBar />

      <Box maxWidth={"1080px"} display={"flex"} flexDirection={"column"} gap={"24px"} m={"32px auto"}>
        <Typography variant="h5" fontWeight="bold" color={"red"}>
          Cập nhật tiến độ dự án
        </Typography>

        <Box>
          <Grid container spacing={3}>
            <Grid item xs={8}>
              <Link component={RouterLink} to={`/thong-bao/${news[0].slug}`}>
                <Card
                  sx={{
                    position: "relative",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <img style={{ width: "100%", height: "400px", objectFit: "cover" }} alt={news[0].title} src={news[0].image ?? "https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png"} />
                  <Box
                    style={{
                      position: "absolute",
                      bottom: 0,
                      color: "#fff",
                      width: "100%",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" color="#fff">
                        {news[0].name}
                      </Typography>
                      <Typography variant="body1" color="#fff">
                        {new Date(news[0].publish_date).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })}{" "}
                      </Typography>
                    </CardContent>
                  </Box>
                </Card>
              </Link>
            </Grid>
            <Grid item xs={4}>
              <Box display={"flex"} flexDirection={"column"} justifyContent={"space-between"}>
                {news.map((latestPost, index) => {
                  if (index === 0) return;
                  return (
                    <Link component={RouterLink} to={`/thong-bao/${latestPost.slug}`} style={{ textDecoration: "none", cursor: "pointer" }}>
                      <Box
                        key={index}
                        display={"flex"}
                        gap={"8px"}
                        alignItems={"center"}
                        minHeight={"100px"}
                        sx={{
                          transition: "transform 0.3s ease-in-out",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                        }}
                      >
                        <Avatar variant="rounded" src={latestPost.image} sx={{ width: "80px", height: "80px", objectFit: "cover" }} />
                        <Box display={"flex"} flexDirection={"column"} gap={"8px"}>
                          <Typography variant="body2" color="#334862">
                            {latestPost.name.length > 100 ? `${latestPost.name.substring(0, 100)}...` : latestPost.name}
                          </Typography>

                          <Typography variant="body2" color="#334862" fontSize={"12px"}>
                            {new Date(latestPost.publish_date).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })}
                          </Typography>
                        </Box>
                      </Box>
                    </Link>
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box maxWidth={"1080px"} display={"flex"} flexDirection={"column"} gap={"24px"} m={"64px auto"}>
        <Typography variant="h5" fontWeight="bold" color={"red"}>
          Dự án thiện nguyện
        </Typography>

        <Tabs>
          <TabList>
            {PROJECT_LIST.children.slice(0, 5).map((child, index) => (
              <Tab key={index} onClick={() => setProjectTab(child.path)}>
                {child.title}
              </Tab>
            ))}
          </TabList>
          {PROJECT_LIST.children.slice(0, 5).map((child, index) => (
            <TabPanel key={index} style={{ marginTop: "24px" }}>
              <CardList title={""} posts={projects} loading={loading} showDescription={false} category={projectTab} />
            </TabPanel>
          ))}
        </Tabs>
      </Box>

      <CarouselMembers />
      <Companion />
      <Footer />
    </Box>
  );
}
