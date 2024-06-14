import React, { useState, useEffect } from "react";
import axios from "axios";
import { HEADER_DROPDOWN_LIST, SERVER_URL } from "../constants";
import { Box, Typography, Grid, Card, Link, CardContent, Avatar, LinearProgress, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import CountUp from "react-countup";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { useNavigate } from "react-router-dom";
import HeaderBar from "../components/Header";
import Footer from "../components/Footer";
import Companion from "../components/Companion";
import CarouselMembers from "../components/CarouselMembers";
import CardList from "../components/CardList";
import LoadingScreen from "../components/LoadingScreen";

const PROJECT_LIST = HEADER_DROPDOWN_LIST.find((item) => item.name === "du-an");

export default function Home() {
  const [news, setNews] = useState([]);
  const [projects, setProjects] = useState([]);
  const [general, setGeneral] = useState({});
  const [projectTab, setProjectTab] = useState("/du-an-2024");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([axios.get(SERVER_URL + "/thong-bao" + "/getLatestPosts"), axios.get(SERVER_URL + "/getGeneralData")])
      .then(([news, general]) => {
        setNews(news.data);
        setGeneral(general.data);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    setLoading(true);
    axios
      .get(SERVER_URL + projectTab, { params: { _start: 0, _end: 8 } })
      .then((projects) => {
        setProjects(projects.data);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [projectTab]);

  if (!(news?.length > 0 && projects?.length > 0 && Object.keys(general)?.length > 0)) return <LoadingScreen />;
  return (
    <Box>
      <HeaderBar />

      <Box maxWidth={"1080px"} display={"flex"} flexDirection={"column"} gap={"24px"} m={"32px auto"}>
        <Typography variant="h5" fontWeight="bold" color={"red"}>
          Cập nhật tiến độ dự án
        </Typography>

        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={8}>
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
                        {new Date(news[0].publish_date).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })}
                      </Typography>
                    </CardContent>
                  </Box>
                </Card>
              </Link>
            </Grid>
            <Grid item xs={12} sm={4}>
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
                <Typography variant="body1">
                  {child.title} ({general?.category[child.path.replace("/", "")]})
                </Typography>
              </Tab>
            ))}
          </TabList>

          {loading && (
            <Box minHeight={"500px"} mt={"200px"}>
              <LinearProgress />
            </Box>
          )}
          {!loading && (
            <>
              {PROJECT_LIST.children.slice(0, 5).map((child, index) => (
                <Box display={"flex"} flexDirection={"column"} gap="24px">
                  <TabPanel key={index} style={{ marginTop: "24px" }}>
                    <CardList title={""} posts={projects} loading={loading} showDescription={false} category={projectTab} />
                  </TabPanel>

                  {projectTab === child.path && (
                    <Button variant="contained" onClick={() => navigate(child.path)}>
                      Xem các {child.title}
                    </Button>
                  )}
                </Box>
              ))}
            </>
          )}
        </Tabs>
      </Box>

    <Box bgcolor={"#f2f2f2"} height={"100%"}>
  <Box maxWidth={"1080px"} display={"flex"} flexDirection={"column"} gap={"24px"} m={"0 auto"} p={"16px"}>
    <Typography variant="h3" color={"red"} textAlign={"center"}>
      Dự Án Sức Mạnh 2000
    </Typography>
  </Box>

  <Box maxWidth={"700px"} display={"flex"} gap={"24px"} m={"0 auto"}>
    <Grid container spacing={3} sx={{ justifyItems: "center", alignItems: "center" }}>
      <Grid item xs={12} sm={6} sx={{ textAlign: { xs: "center", sm: "right" } }}>
        <Typography variant="h6">
          Mục tiêu cùng cộng đồng xoá <strong>TOÀN BỘ</strong> điểm trường gỗ, tôn tạm bợ trên <strong>TOÀN QUỐC</strong>. Xây dựng đủ Khu nội trú, Cầu đi học, và Nhà hạnh phúc.
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6} sx={{ textAlign: "center" }}>
        <Typography variant="h1" fontWeight={"bold"} color={"red"}>
          <CountUp start={0} end={general?.classification?.total} duration={10} />
        </Typography>
        <Typography variant="h6" fontWeight={"bold"}>
          TỔNG DỰ ÁN ĐÃ THỰC HIỆN
        </Typography>
      </Grid>
    </Grid>
  </Box>

  <Box maxWidth={"1080px"} display={"flex"} gap={"24px"} m={"32px auto"}>
    <Grid container spacing={3} sx={{ justifyItems: "center", alignItems: "center" }}>
      <Grid item xs={6} sm={2.4}>
        <Typography variant="h2" fontWeight={"bold"} color={"red"} textAlign="center">
          <CountUp start={0} end={general?.classification["truong-hoc"]} duration={10} />
        </Typography>
        <Typography variant="body1" fontWeight={"bold"} textAlign="center">
          Dự án xây trường đang thực hiện trên toàn quốc.
        </Typography>
      </Grid>
      <Grid item xs={6} sm={2.4}>
        <Typography variant="h2" fontWeight={"bold"} color={"red"} textAlign="center">
          <CountUp start={0} end={general?.classification["khu-noi-tru"]} duration={10} />
        </Typography>
        <Typography variant="body1" fontWeight={"bold"} textAlign="center">
          Khu nội trú đã hoàn thiện và tiếp tục tăng
        </Typography>
      </Grid>
      <Grid item xs={6} sm={2.4}>
        <Typography variant="h2" fontWeight={"bold"} color={"red"} textAlign="center">
          <CountUp start={0} end={general?.classification["nha-hanh-phuc"]} duration={10} />
        </Typography>
        <Typography variant="body1" fontWeight={"bold"} textAlign="center">
          Nhà hạnh phúc đã và đang được xây dựng
        </Typography>
      </Grid>
      <Grid item xs={6} sm={2.4}>
        <Typography variant="h2" fontWeight={"bold"} color={"red"} textAlign="center">
          <CountUp start={0} end={general?.classification["cau-hanh-phuc"]} duration={10} />
        </Typography>
        <Typography variant="body1" fontWeight={"bold"} textAlign="center">
          Cầu hạnh phúc đã và đang được xây dựng
        </Typography>
      </Grid>
      <Grid item xs={6} sm={2.4}>
        <Typography variant="h2" fontWeight={"bold"} color={"red"} textAlign="center">
          <CountUp start={0} end={general?.classification["wc"]} duration={10} />
        </Typography>
        <Typography variant="body1" fontWeight={"bold"} textAlign="center">
          WC đã và đang được xây dựng
        </Typography>
      </Grid> 
    </Grid>
  </Box>
</Box>


      <CarouselMembers />
      <Companion />
      <Footer />
    </Box>
  );
}
