import React, { useState, useEffect } from "react";
import axios from "axios";
import banner from "../assets/home/banner.jpeg";
import { ReactComponent as HeartIcon } from "../assets/home/heart-icon.svg";
import { DESKTOP_WIDTH, HEADER_DROPDOWN_LIST, SERVER_URL } from "../constants";
import {
  useMediaQuery,
  Box,
  Typography,
  Grid,
  Card,
  Link,
  CardContent,
  Avatar,
  LinearProgress,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import CountUp from "react-countup";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { useNavigate } from "react-router-dom";
import CarouselListCard from "../components/CarouselListCard";
import LoadingScreen from "../components/LoadingScreen";
import { COMPANIONS } from "../components/Companion";

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
    Promise.all([
      axios.get(SERVER_URL + "/thong-bao", { params: { start: 0, end: 5 } }),
      axios.get(SERVER_URL + "/getClassificationAndCategoryCounts"),
      axios.get(SERVER_URL + "/getTotalProjectsCount"),
    ])
      .then(([news, classificationAndCategoryCounts, totalProjectsCount]) => {
        setNews(news.data.posts);
        setGeneral(classificationAndCategoryCounts.data);
        setTotalFinishedProjects(Number(totalProjectsCount.data));
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    setLoading(true);
    axios
      .get(SERVER_URL + projectTab)
      .then((projects) => {
        setProjects(projects.data.posts);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [projectTab]);

  if (
    !(
      news?.length > 0 &&
      projects?.length > 0 &&
      Object.keys(general)?.length > 0
    )
  )
    return <LoadingScreen />;
  return (
    <>
      {/* banner */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "repeat(1, minmax(0, 1fr))"
            : "repeat(2, minmax(0, 1fr))",
          margin: isMobile ? "24px 16px" : "88px auto",
          alignItems: "center",
          maxWidth: DESKTOP_WIDTH,
        }}
      >
        <Box
          maxWidth={DESKTOP_WIDTH}
          display={"flex"}
          flexDirection={"column"}
          gap={"24px"}
          p={"16px"}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "red",
            }}
          >
            {" "}
            Giới thiệu
          </Typography>
          <Typography variant="h4" fontWeight={"700"}>
            Dự Án Sức Mạnh 2000
          </Typography>
          <Typography variant="body1">
            Mục tiêu cùng cộng đồng xoá TOÀN BỘ điểm trường gỗ, tôn tạm bợ trên
            TOÀN QUỐC. Xây dựng đủ Khu nội trú, Cầu đi học, và Nhà hạnh phúc.
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "red",
            }}
            color={"red"}
          >
            {" "}
            Đơn vị đồng hành
          </Typography>
          <Grid container display={"flex"} gap={"12px"}>
            {COMPANIONS.map((d, index) => (
              <Grid key={index}>
                <img
                  src={d.url}
                  alt={d.name}
                  style={{
                    width: isMobile ? "60px" : "100px",
                    height: isMobile ? "60px" : "100px",
                    objectFit: "contain",
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
        <div>
          <img
            src={banner}
            alt="banner"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "0 64px 0 64px",
            }}
          />
        </div>
      </div>

      {/* statictis */}

      <Grid
        container
        maxWidth={DESKTOP_WIDTH}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
          margin: "16px auto",
        }}
      >
        <HeartIcon />
        <Grid item xs={12} sm={6} sx={{ textAlign: "center" }}>
          <Typography variant="h2" fontWeight={"bold"}>
            <CountUp start={0} end={totalFinishedProjects} duration={10} />
          </Typography>
          <Typography variant="h6" fontWeight={"bold"}>
            TỔNG DỰ ÁN ĐÃ THỰC HIỆN
          </Typography>
        </Grid>
      </Grid>
      <Grid
        container
        spacing={2}
        sx={{
          border: "1px solid #fff",
          paddingBottom: 2,
          borderRadius: 2,
          margin: "16px auto",
          boxShadow: 2,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          maxWidth: DESKTOP_WIDTH,
        }}
      >
        <Grid item container xs={12} sm={2.4 * 2}>
          <Grid item xs={6} sm={6} borderRight={"2px solid #D9D9D9"}>
            <Typography
              variant="h2"
              fontWeight={"bold"}
              color={"red"}
              textAlign="center"
            >
              <CountUp
                start={0}
                end={general?.classification["truong-hoc"]}
                duration={10}
              />
            </Typography>
            <Typography variant="body1" fontWeight={"bold"} textAlign="center">
              Trường học
            </Typography>
          </Grid>

          <Grid
            item
            xs={6}
            sm={6}
            borderRight={isMobile ? "" : "2px solid #D9D9D9"}
          >
            <Typography
              variant="h2"
              fontWeight={"bold"}
              color={"red"}
              textAlign="center"
            >
              <CountUp
                start={0}
                end={general?.classification["khu-noi-tru"]}
                duration={10}
              />
            </Typography>
            <Typography variant="body1" fontWeight={"bold"} textAlign="center">
              Khu nội trú
            </Typography>
          </Grid>
        </Grid>
        <Grid item container xs={12} sm={2.4 * 3}>
          <Grid item xs={4} borderRight={"2px solid #D9D9D9"}>
            <Typography
              variant="h2"
              fontWeight={"bold"}
              color={"red"}
              textAlign="center"
            >
              <CountUp
                start={0}
                end={general?.classification["nha-hanh-phuc"]}
                duration={10}
              />
            </Typography>
            <Typography variant="body1" fontWeight={"bold"} textAlign="center">
              Nhà hạnh phúc
            </Typography>
          </Grid>
          <Grid item xs={4} borderRight={"2px solid #D9D9D9"}>
            <Typography
              variant="h2"
              fontWeight={"bold"}
              color={"red"}
              textAlign="center"
            >
              <CountUp
                start={0}
                end={general?.classification["cau-hanh-phuc"]}
                duration={10}
              />
            </Typography>
            <Typography variant="body1" fontWeight={"bold"} textAlign="center">
              Cầu đi học
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography
              variant="h2"
              fontWeight={"bold"}
              color={"red"}
              textAlign="center"
            >
              <CountUp
                start={0}
                end={general?.classification["wc"]}
                duration={10}
              />
            </Typography>
            <Typography variant="body1" fontWeight={"bold"} textAlign="center">
              Nhà vệ sinh
            </Typography>
          </Grid>
        </Grid>
      </Grid>

      {/* projects progress */}
      <Box
        maxWidth={DESKTOP_WIDTH}
        display={"flex"}
        flexDirection={"column"}
        gap={"24px"}
        margin={"40px auto"}
      >
        <Typography variant="h5" fontWeight="bold">
          Tiến độ dự án
        </Typography>

        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8} borderRadius={2}>
              <RouterLink
                to={`/thong-bao/${news[0].slug}`}
                style={{
                  textDecoration: "none",
                }}
              >
                <Card
                  sx={{
                    position: "relative",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                    padding: "16px",
                    border: "1px solid #F0F0F0",
                    borderRadius: 2,
                  }}
                >
                  <img
                    style={{
                      width: "100%",
                      height: "320px",
                      objectFit: "cover",
                    }}
                    alt={news[0].name}
                    src={news[0].thumbnail}
                  />
                  <Box>
                    <CardContent>
                      <Typography
                        variant="body1"
                        fontWeight={"bold"}
                        color="black"
                      >
                        {news[0].name}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="black"
                        sx={{
                          textDecoration: "none",
                        }}
                      >
                        {new Date(news[0].publishDate).toLocaleDateString(
                          "vi-VN",
                          { day: "numeric", month: "long", year: "numeric" }
                        )}
                      </Typography>
                    </CardContent>
                  </Box>
                </Card>
              </RouterLink>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"space-between"}
                height={"100%"}
              >
                {news.map((latestPost, index) => {
                  if (index === 0) return null;
                  return (
                    <RouterLink
                      key={index}
                      to={`/thong-bao/${latestPost.slug}`}
                      style={{
                        cursor: "pointer",
                        textDecoration: "none",
                      }}
                    >
                      <Box
                        display={"flex"}
                        gap={"8px"}
                        alignItems={"center"}
                        minHeight={"100px"}
                        padding={"12px"}
                        border={"1px solid #F0F0F0"}
                        borderRadius={2}
                        sx={{
                          transition: "transform 0.3s ease-in-out",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                        }}
                      >
                        <Avatar
                          variant="rounded"
                          src={latestPost.thumbnail}
                          sx={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                          }}
                        />
                        <Box
                          display={"flex"}
                          flexDirection={"column"}
                          gap={"8px"}
                          sx={{
                            textDecoration: "none !important",
                          }}
                        >
                          <Typography variant="body2" color="#334862">
                            {latestPost.name.length > 100
                              ? `${latestPost.name.substring(0, 100)}...`
                              : latestPost.name}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="#334862"
                            fontSize={"12px"}
                          >
                            {new Date(
                              latestPost.publishDate
                            ).toLocaleDateString("vi-VN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </Typography>
                        </Box>
                      </Box>
                    </RouterLink>
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* projects */}
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
        <Typography variant="h5" fontWeight="bold">
          Dự án thiện nguyện
        </Typography>

        <Tabs>
          <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
            <TabList>
              {PROJECT_LIST.children.map(
                (child, index) =>
                  !["/du-an-2014-2015", "/du-an-2012"].includes(child.path) && (
                    <Tab
                      key={child.path + index}
                      onClick={() => setProjectTab(child.path)}
                    >
                      <Typography variant="body1">
                        {child.title} (
                        {general?.category[child.path.replace("/", "")]})
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
                .filter(
                  (child) =>
                    !["/du-an-2014-2015", "/du-an-2012"].includes(child.path)
                )
                .map((child, index) => (
                  <Box
                    key={child.path + index}
                    display={"flex"}
                    flexDirection={"column"}
                  >
                    <TabPanel>
                      <CarouselListCard
                        posts={projects}
                        category={projectTab.replace("/", "")}
                      />
                    </TabPanel>

                    {projectTab === child.path && (
                      <Button
                        variant="contained"
                        onClick={() => navigate(child.path)}
                      >
                        Xem các {child.title}
                      </Button>
                    )}
                  </Box>
                ))}
            </>
          )}
        </Tabs>
      </Box>
    </>
  );
}
