import React, { useState, useEffect } from "react";
import axios from "axios";
import { DESKTOP_WIDTH, HEADER_DROPDOWN_LIST, SERVER_URL } from "../constants";
import { useMediaQuery, Box, Typography, Grid, Card, Link, CardContent, Avatar, LinearProgress, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import CountUp from "react-countup";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import CarouselListCard from "../components/CarouselListCard";

const PROJECT_LIST = HEADER_DROPDOWN_LIST.find((item) => item.name === "du-an");

export default function Home() {
  const [news, setNews] = useState([]);
  const [projects, setProjects] = useState([]);
  const [general, setGeneral] = useState({});
  const [projectTab, setProjectTab] = useState("/du-an-2024");
  const [loading, setLoading] = useState(false);
  const [totalFinishedProjects, setTotalFinishedProjects] = useState(0);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    setLoading(true);
    console.time("Loading Time Common data");

    Promise.all([axios.get(SERVER_URL + "/thong-bao" + "/getLatestPosts"), axios.get(SERVER_URL + "/getClassificationAndCategoryCounts"), axios.get(SERVER_URL + "/getTotalProjectsCount")])
      .then(([news, classificationAndCategoryCounts, totalProjectsCount]) => {
        setNews(news.data);
        setGeneral(classificationAndCategoryCounts.data);
        setTotalFinishedProjects(Number(totalProjectsCount.data));

        setLoading(false);
        console.timeEnd("Loading Time Common data");
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    setLoading(true);
    console.time("Loading Time Projects list");

    axios
      .get(SERVER_URL + projectTab)
      .then((projects) => {
        setProjects(projects.data.posts);

        setLoading(false);
        console.timeEnd("Loading Time Projects list");
      })
      .catch((e) => console.error(e));
  }, [projectTab]);

  if (!(news?.length > 0 && projects?.length > 0 && Object.keys(general)?.length > 0)) return <LoadingScreen />;
  return (
    <>
      <Box maxWidth={DESKTOP_WIDTH} display={"flex"} flexDirection={"column"} gap={"24px"} m={isMobile ? "24px 16px" : "88px auto 24px"}>
        <Typography variant="h5" fontWeight="bold" color={"red"}>
          Cập nhật tiến độ dự án
        </Typography>

        <Box>
          <Grid container spacing={3} sx={{ alignItems: "center" }}>
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
                  <img
                    style={{
                      width: "100%",
                      height: "400px",
                      objectFit: "cover",
                    }}
                    alt={news[0].title}
                    src={news[0].image ?? "https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png"}
                  />
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
                    <Link key={latestPost.slug + index} component={RouterLink} to={`/thong-bao/${latestPost.slug}`} style={{ textDecoration: "none", cursor: "pointer" }}>
                      <Box
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
                        <Avatar
                          variant="rounded"
                          src={latestPost.image}
                          sx={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                          }}
                        />
                        <Box display={"flex"} flexDirection={"column"} gap={"8px"}>
                          <Typography variant="body2" color="#334862">
                            {latestPost.name.length > 100 ? `${latestPost.name.substring(0, 100)}...` : latestPost.name}
                          </Typography>

                          <Typography variant="body2" color="#334862" fontSize={"12px"}>
                            {new Date(latestPost.publish_date).toLocaleDateString("vi-VN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
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

      <Box
        maxWidth={DESKTOP_WIDTH}
        display={"flex"}
        flexDirection={"column"}
        gap={"24px"}
        m={"40px auto"}
        sx={{
          "@media (max-width: 600px)": {
            m: "16px auto",
            p: "0 16px",
          },
        }}
      >
        <Typography variant="h5" fontWeight="bold" color={"red"}>
          Dự án thiện nguyện
        </Typography>

        <Tabs>
          <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
            <TabList>
              {PROJECT_LIST.children.map(
                (child, index) =>
                  !["/du-an-2014-2015", "/du-an-2012"].includes(child.path) && (
                    <Tab key={child.path + index} onClick={() => setProjectTab(child.path)}>
                      <Typography variant="body1">
                        {child.title} ({general?.category[child.path.replace("/", "")]})
                      </Typography>
                    </Tab>
                  )
              )}
            </TabList>
          </div>

          {loading ? (
            <Box minHeight={"500px"} mt={"200px"}>
              <LinearProgress />
            </Box>
          ) : (
            <>
              {PROJECT_LIST.children
                .filter((child) => !["/du-an-2014-2015", "/du-an-2012"].includes(child.path))
                .map((child, index) => (
                  <Box key={child.path + index} display={"flex"} flexDirection={"column"}>
                    <TabPanel>
                      {/* <Grid container spacing={3} p={"16px"}> */}
                      {/* <CardList title={""} posts={projects} loading={loading} showDescription={false} category={projectTab} /> */}
                      {/* </Grid> */}
                      <CarouselListCard posts={projects} category={projectTab.replace("/", "")} />
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

      <Box bgcolor={"#f2f2f2"} height={"100%"} p={"32px 0"}>
        <Box maxWidth={DESKTOP_WIDTH} display={"flex"} flexDirection={"column"} gap={"24px"} m={"0 auto"} p={"16px"}>
          <Typography variant="h3" color={"red"} textAlign={"center"}>
            Dự Án Sức Mạnh 2000
          </Typography>
        </Box>

        <Box maxWidth={"700px"} display={"flex"} gap={"24px"} m={"0 auto"}>
          <Grid container spacing={3} sx={{ justifyItems: "center", alignItems: "center" }}>
            <Grid item xs={12} sm={6} sx={{ textAlign: isMobile ? "center" : "right" }} p={isMobile ? "0 8px" : 0}>
              <Typography variant="h6">
                Mục tiêu cùng cộng đồng xoá <strong>TOÀN BỘ</strong> điểm trường gỗ, tôn tạm bợ trên <strong>TOÀN QUỐC</strong>. Xây dựng đủ Khu nội trú, Cầu đi học, và Nhà hạnh phúc.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ textAlign: "center" }}>
              <Typography variant="h1" fontWeight={"bold"} color={"red"}>
                <CountUp start={0} end={totalFinishedProjects} duration={10} />
              </Typography>
              <Typography variant="h6" fontWeight={"bold"}>
                TỔNG DỰ ÁN ĐÃ THỰC HIỆN
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box maxWidth={DESKTOP_WIDTH} display={"flex"} gap={"24px"} m={"32px auto"}>
          <Grid container spacing={3} sx={{ justifyItems: "center", alignItems: "center" }}>
            <Grid item xs={6} sm={2.4}>
              <Typography variant="h2" fontWeight={"bold"} color={"red"} textAlign="center">
                <CountUp start={0} end={general?.classification["truong-hoc"]} duration={10} />
              </Typography>
              <Typography variant="body1" fontWeight={"bold"} textAlign="center">
                Trường học
              </Typography>
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <Typography variant="h2" fontWeight={"bold"} color={"red"} textAlign="center">
                <CountUp start={0} end={general?.classification["khu-noi-tru"]} duration={10} />
              </Typography>
              <Typography variant="body1" fontWeight={"bold"} textAlign="center">
                Khu nội trú
              </Typography>
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <Typography variant="h2" fontWeight={"bold"} color={"red"} textAlign="center">
                <CountUp start={0} end={general?.classification["nha-hanh-phuc"]} duration={10} />
              </Typography>
              <Typography variant="body1" fontWeight={"bold"} textAlign="center">
                Nhà hạnh phúc
              </Typography>
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <Typography variant="h2" fontWeight={"bold"} color={"red"} textAlign="center">
                <CountUp start={0} end={general?.classification["cau-hanh-phuc"]} duration={10} />
              </Typography>
              <Typography variant="body1" fontWeight={"bold"} textAlign="center">
                Cầu đi học
              </Typography>
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <Typography variant="h2" fontWeight={"bold"} color={"red"} textAlign="center">
                <CountUp start={0} end={general?.classification["wc"]} duration={10} />
              </Typography>
              <Typography variant="body1" fontWeight={"bold"} textAlign="center">
                Nhà vệ sinh
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}
