import React, { useState, useEffect } from "react";
import axios from "axios";
import { DESKTOP_WIDTH, HEADER_DROPDOWN_LIST, SERVER_URL } from "../constants";
import { useMediaQuery, Box, Typography, Grid, Card, Link, CardContent, Avatar, LinearProgress, Button, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import CountUp from "react-countup";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import CarouselListCard from "../components/CarouselListCard";
import constructionIcon from "../assets/construction.svg";
import peopleIcon from "../assets/people.svg";
import { findTitle, standardizeString } from "../helpers";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const PROJECT_LIST = HEADER_DROPDOWN_LIST.find((item) => item.name === "du-an");

export default function Home() {
  const [news, setNews] = useState([]);
  const [projects, setProjects] = useState([]);
  const [general, setGeneral] = useState({});
  const [projectTab, setProjectTab] = useState("/du-an-2025");
  const [loading, setLoading] = useState(false);
  const [totalFinishedProjects, setTotalFinishedProjects] = useState(0);
  const [totalBeneficialStudents, setTotalBeneficialStudents] = useState(0);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(SERVER_URL + "/thong-bao", { params: { start: 0, end: 5 } }),
      axios.get(SERVER_URL + "/getTotalStatisticsCount"),
      axios.get(SERVER_URL + "/getTotalProjectsCount"),
      axios.get(SERVER_URL + "/getTotalStudentsCount"),
    ])
      .then(([news, totalStatisticsCount, totalProjectsCount, totalStudentsCount]) => {
        setNews(news.data.posts);
        setGeneral(totalStatisticsCount.data);
        setTotalFinishedProjects(totalProjectsCount.data);
        setTotalBeneficialStudents(totalStudentsCount.data);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    setLoading(true);
    axios
      .get(SERVER_URL + projectTab, { params: { sortField: "random" } })
      .then((projects) => {
        setProjects(projects.data.posts);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [projectTab]);

  if (!(news?.length > 0 && projects?.length > 0 && Object.keys(general)?.length > 0)) return <LoadingScreen />;
  return (
    <Box maxWidth={DESKTOP_WIDTH} width={"100%"} m={"0 auto"}>
      {/* News: Tien do du an */}
      <Box display={"flex"} flexDirection={"column"} gap={"24px"} m={isMobile ? "24px 16px" : "24px auto"}>
        <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
          <Typography variant="h5" fontWeight="bold" color={"red"}>
            Cập nhật tiến độ dự án
          </Typography>

          {isMobile ? (
            <IconButton
              sx={{
                border: "1px solid red",
                borderRadius: "4px",
                height: "30px",
              }}
              onClick={() => navigate("/thong-bao")}
            >
              <ArrowForwardIcon sx={{ color: "red" }} />
            </IconButton>
          ) : (
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              sx={{
                color: "red",
                textTransform: "none",
                borderColor: "red",
                "&:hover": {
                  borderColor: "red",
                },
              }}
              onClick={() => navigate("/thong-bao")}
            >
              Xem tất cả tin tức
            </Button>
          )}
        </Box>

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
                    alt={news[0].name}
                    src={news[0].thumbnail}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      color: "#fff",
                      width: "100%",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    <CardContent sx={{ "&.MuiCardContent-root:last-child": { p: 2 } }}>
                      <Typography variant="h6" color="#fff">
                        {news[0].name}
                      </Typography>
                      <Typography variant="body1" color="#fff">
                        {new Date(news[0].createdAt).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })}
                      </Typography>
                    </CardContent>
                  </Box>
                </Card>
              </Link>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box display={"flex"} flexDirection={"column"} justifyContent={"space-between"}>
                {news.map((latestPost, index) => {
                  if (index === 0) return null;
                  return (
                    <Link key={index} component={RouterLink} to={`/thong-bao/${latestPost.slug}`} style={{ textDecoration: "none", cursor: "pointer" }}>
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
                          src={latestPost.thumbnail}
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
                            {new Date(latestPost.createdAt).toLocaleDateString("vi-VN", {
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

      {/* Projects: Du an thien nguyen */}
      <Box
        display={"flex"}
        flexDirection={"column"}
        gap={"24px"}
        m={"40px auto 0px"}
        sx={{
          "@media (max-width: 600px)": {
            m: "16px auto",
            p: "0 16px",
          },
        }}
      >
        <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
          <Typography variant="h5" fontWeight="bold" color={"red"}>
            Dự án thiện nguyện
          </Typography>

          <Button
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            sx={{
              color: "red",
              textTransform: "none",
              borderColor: "red",
              "&:hover": { borderColor: "red" },
            }}
            onClick={() => navigate("/search")}
          >
            {isMobile ? "Tất cả" : "Xem tất cả Dự án"}
          </Button>
        </Box>

        <Tabs>
          <Box sx={{ overflowX: "auto", whiteSpace: "nowrap" }}>
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
          </Box>

          {loading ? (
            <Box minHeight={"500px"} mt={"200px"}>
              <LinearProgress />
            </Box>
          ) : (
            <>
              {PROJECT_LIST.children
                .filter((child) => !["/du-an-2014-2015", "/du-an-2012"].includes(child.path))
                .map((child, index) => (
                  <TabPanel key={index}>
                    <CarouselListCard posts={projects} category={projectTab.replace("/", "")} />
                    <Button
                      variant="outlined"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        marginTop: "16px",
                        color: "red",
                        textTransform: "none",
                        borderColor: "red",
                        "&:hover": { borderColor: "red", bgcolor: "#ff474c", color: "#fff" },
                        width: "100%",
                      }}
                      onClick={() => navigate(projectTab)}
                    >
                      Xem tất cả {standardizeString(findTitle(HEADER_DROPDOWN_LIST, projectTab))}
                    </Button>
                  </TabPanel>
                ))}
            </>
          )}
        </Tabs>
      </Box>

      {/* Projects Statistics */}
      <Box display="flex" flexDirection={"column"} gap={"16px"} p={isMobile ? "24px 16px" : "40px"}>
        <Box display={"flex"} flexDirection={"column"} justifyContent={"center"} width={"100%"}>
          <Typography variant="h3" fontWeight={"bold"} color={"red"} textAlign={"center"}>
            Dự Án Sức Mạnh 2000
          </Typography>
          <Typography variant="h6" textAlign={"center"} p={isMobile ? "8px" : "8px 80px"}>
            Mục tiêu cùng cộng đồng xóa toàn bộ <strong>Điểm trường</strong> gỗ, tôn tạm bợ trên toàn quốc.
            <br />
            Xây dựng đủ <strong>Nhà hạnh phúc</strong>, <strong>Cầu đi học</strong>, và <strong>Khu nội trú</strong>.
          </Typography>
        </Box>
        <Box display={"flex"} flexDirection={isMobile ? "column" : "row"} alignItems={"center"}>
          <Box width={isMobile ? "100%" : "50%"} display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
            <img src={constructionIcon} alt="construction" style={{ width: "100px", height: "100px" }} />
            <Typography variant="h2" fontWeight={"bold"} color={"red"}>
              <CountUp start={0} end={totalFinishedProjects} duration={10} />
            </Typography>
            <Typography variant="h6" fontWeight={"bold"}>
              TỔNG DỰ ÁN ĐÃ THỰC HIỆN
            </Typography>
          </Box>

          <Box width={isMobile ? "100%" : "50%"} display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
            <img src={peopleIcon} alt="people" style={{ width: "100px", height: "100px" }} />
            <Typography variant="h2" fontWeight={"bold"} color={"red"}>
              <CountUp start={0} end={totalBeneficialStudents} duration={10} />
            </Typography>
            <Typography variant="h6" fontWeight={"bold"}>
              TỔNG SỐ HỌC SINH HƯỞNG LỢI
            </Typography>
          </Box>
        </Box>
        {/* Statistics row 1 */}
        <Box
          sx={{
            border: "1px solid #fff",
            borderRadius: 2,
            margin: "16px auto",
            boxShadow: 2,
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr",
            gap: 2,
            width: "100%",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              borderRight: isMobile ? "none" : "2px solid #D9D9D9",
              padding: "16px",
              textAlign: "center",
              flex: 1,
            }}
          >
            <Typography variant="h2" fontWeight="bold" color="red">
              <CountUp start={0} end={general?.classification["truong-hoc"]} duration={10} />
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              Điểm trường
            </Typography>
          </Box>

          <Box
            sx={{
              borderRight: isMobile ? "none" : "2px solid #D9D9D9",
              padding: "16px",
              textAlign: "center",
              flex: 1,
            }}
          >
            <Typography variant="h2" fontWeight="bold" color="red">
              <CountUp start={0} end={general?.classification["nha-hanh-phuc"]} duration={10} />
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              Nhà hạnh phúc
            </Typography>
          </Box>

          <Box
            sx={{
              borderRight: isMobile ? "none" : "2px solid #D9D9D9",
              padding: "16px",
              textAlign: "center",
              flex: 1,
            }}
          >
            <Typography variant="h2" fontWeight="bold" color="red">
              <CountUp start={0} end={general?.classification["cau-hanh-phuc"]} duration={10} />
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              Cầu đi học
            </Typography>
          </Box>

          <Box
            sx={{
              padding: "16px",
              textAlign: "center",
              flex: 1,
            }}
          >
            <Typography variant="h2" fontWeight="bold" color="red">
              <CountUp start={0} end={general?.classification["khu-noi-tru"]} duration={10} />
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              Khu nội trú
            </Typography>
          </Box>
        </Box>

        {/* Statistics row 2 */}
        <Box
          sx={{
            border: "1px solid #fff",
            borderRadius: 2,
            margin: "16px auto",
            boxShadow: 2,
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr",
            gap: 2,
            width: "100%",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              borderRight: isMobile ? "none" : "2px solid #D9D9D9",
              padding: "16px",
              textAlign: "center",
              flex: 1,
            }}
          >
            <Typography variant="h2" fontWeight="bold" color="red">
              <CountUp start={0} end={general?.metadata["totalClassrooms"]} duration={10} />
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              Phòng học
            </Typography>
          </Box>

          <Box
            sx={{
              borderRight: isMobile ? "none" : "2px solid #D9D9D9",
              padding: "16px",
              textAlign: "center",
              flex: 1,
            }}
          >
            <Typography variant="h2" fontWeight="bold" color="red">
              <CountUp start={0} end={general?.metadata["totalPublicAffairsRooms"]} duration={10} />
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              Phòng công vụ
              <br />
            </Typography>
            <Typography variant="body2" fontWeight="light" fontSize={"0.7rem"}>
              *Nằm trong điểm trường, không đếm vào số tổng
            </Typography>
          </Box>

          <Box
            sx={{
              borderRight: isMobile ? "none" : "2px solid #D9D9D9",
              padding: "16px",
              textAlign: "center",
              flex: 1,
            }}
          >
            <Typography variant="h2" fontWeight="bold" color="red">
              <CountUp start={0} end={general?.metadata["totalToilets"]} duration={10} />
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              Nhà vệ sinh
            </Typography>
            <Typography variant="body2" fontWeight="light" fontSize={"0.7rem"}>
              *Nằm trong điểm trường, không đếm vào số tổng
            </Typography>
          </Box>

          <Box
            sx={{
              padding: "16px",
              textAlign: "center",
              flex: 1,
            }}
          >
            <Typography variant="h2" fontWeight="bold" color="red">
              <CountUp start={0} end={general?.metadata["totalKitchens"]} duration={10} />
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              Bếp ăn
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
