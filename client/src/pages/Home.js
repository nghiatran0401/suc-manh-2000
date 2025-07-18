import React, { useState, useEffect } from "react";
import axios from "axios";
import { DESKTOP_WIDTH, HEADER_DROPDOWN_LIST, SERVER_URL } from "../constants";
import { useMediaQuery, Box, Typography, Grid, Card, Link, CardContent, Avatar, LinearProgress, Divider, FormControl, Select, MenuItem } from "@mui/material";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import CountUp from "react-countup";
import { Tabs, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import CarouselListCard from "../components/CarouselListCard";
import childrenImage from "../assets/children.png";
import mapSectionImage from "../assets/map-section.svg";
import Companion from "../components/Companion";

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
      {/* Intro */}
      <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={2} p={isMobile ? "16px" : "40px 0"} alignItems="center">
        <Box display={"flex"} flexDirection={"column"} justifyContent={"center"} gap={2} width={isMobile ? "100%" : "50%"}>
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" color={"red"}>
            Giới thiệu
          </Typography>
          <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" color={"black"} textAlign={"left"}>
            Dự Án Sức Mạnh 2000
          </Typography>
          <Typography variant={isMobile ? "body1" : "h6"} textAlign={"left"}>
            Chung tay cùng cộng đồng xóa sổ mọi điểm trường gỗ, mái tôn tạm bợ trên khắp mọi miền đất nước — và xây dựng đầy đủ Khu nội trú, Cầu đi học, cùng những Ngôi nhà Hạnh phúc cho trẻ em vùng cao.
          </Typography>

          <Companion />
        </Box>

        <Box width={isMobile ? "100%" : "50%"}>
          <img
            src={childrenImage}
            alt="Dự án Sức Mạnh 2000"
            style={{
              width: "100%",
              objectFit: "cover",
            }}
          />
        </Box>
      </Box>

      {/* Vietnam map statistics */}
      <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={1} mb={5} px={isMobile ? 3 : 0}>
        <Box display="flex" flexDirection="column" width={isMobile ? "100%" : "30%"} mb={isMobile ? 3 : 0}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Bản đồ các công trình dự án ánh sáng núi rừng - SỨC MẠNH 2000
            </Typography>
            <Typography variant="body1" color="gray">
              Tính từ 2012 đến tháng 3/2025
            </Typography>
          </Box>

          <Box display="flex" marginTop={3} flexDirection="column" bgcolor="#FFF1F0" p={"24px"} borderRadius={5}>
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" color="red" textAlign="center" mb={1}>
              TỔNG <CountUp start={0} end={722} duration={2.5} />
            </Typography>
            <Typography variant="h6" color="red" textAlign="center" mb={1} mt={2}>
              CÔNG TRÌNH GIÁO DỤC
            </Typography>

            <Divider sx={{ my: 2, borderColor: "rgba(255, 0, 0, 0.83)" }} />

            <Typography variant="subtitle1" fontWeight="bold" color="black" textAlign="left" mb={2}>
              Số lượng chi tiết:
            </Typography>

            <Box display="flex" flexDirection="column" gap={1.5}>
              <Box display="flex" alignItems="center" justifyContent="left">
                <Typography fontWeight="bold" textAlign="left">
                  424 - TRƯỜNG HỌC
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" justifyContent="left">
                <Typography fontWeight="bold" textAlign="left">
                  211 - NHÀ HẠNH PHÚC
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" justifyContent="left">
                <Typography fontWeight="bold" textAlign="left">
                  21 - KHU NỘI TRÚ
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" justifyContent="left">
                <Typography fontWeight="bold" textAlign="left">
                  66 - CẦU ĐI HỌC
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Bản đồ bên phải*/}
        <Box width={isMobile ? "100%" : "70%"} display="flex" justifyContent="center" alignItems="flex-start" borderRadius={2} px={isMobile ? 0 : 2}>
          <img
            src={mapSectionImage}
            alt="Bản đồ công trình"
            style={{
              width: "100%",
              maxWidth: "100%",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </Box>
      </Box>

      {/* Projects Statistics */}
      <Box display="flex" flexDirection={"column"} gap={"16px"} p={isMobile ? "24px 16px" : "40px"}>
        <Box display={"flex"} flexDirection={isMobile ? "column" : "row"} gap={"16px"}>
          <Box display={"flex"} flexDirection={"column"} alignItems={"center"} bgcolor="#FFF1F0" p={4} borderRadius={2} width={isMobile ? "100%" : "50%"}>
            <HomeWorkIcon sx={{ color: "red", width: "100px", height: "100px" }} />
            <Typography variant="h2" fontWeight={"bold"} color={"red"}>
              <CountUp start={0} end={totalFinishedProjects} duration={10} />
            </Typography>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight={"bold"}>
              TỔNG DỰ ÁN ĐÃ THỰC HIỆN
            </Typography>
          </Box>

          <Box display={"flex"} flexDirection={"column"} alignItems={"center"} bgcolor="#FFF1F0" p={4} borderRadius={2} width={isMobile ? "100%" : "50%"}>
            <PeopleOutlinedIcon sx={{ color: "red", width: "100px", height: "100px" }} />
            <Typography variant="h2" fontWeight={"bold"} color={"red"}>
              <CountUp start={0} end={totalBeneficialStudents} duration={10} />
            </Typography>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight={"bold"}>
              TỔNG SỐ HỌC SINH HƯỞNG LỢI
            </Typography>
          </Box>
        </Box>

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

        <Box>
          <Typography variant="body2" fontWeight="light" mb="8px">
            *Nằm trong điểm trường / nhà hạnh phúc (không đếm vào số tổng)
          </Typography>
          <Box
            sx={{
              border: "1px solid #fff",
              borderRadius: 2,
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

      {/* Projects progress news */}
      <Box display={"flex"} flexDirection={"column"} gap={"24px"} m={isMobile ? "24px 16px" : "24px auto"}>
        <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" color={"red"}>
            Tiến độ dự án
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "gray",
              display: "flex",
              fontWeight: "800",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => navigate("/thong-bao")}
          >
            Xem tất cả
          </Typography>
        </Box>

        <Box>
          <Grid container spacing={3} sx={{ alignItems: "center" }}>
            <Grid item xs={12} sm={8}>
              <Link component={RouterLink} to={`/thong-bao/${news[0].slug}`} style={{ textDecoration: "none" }}>
                <Card
                  sx={{
                    borderRadius: 2,
                    border: "1px solid #f0f0f0",
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": {
                      transform: "scale(1.02)",
                    },
                    overflow: "hidden",
                  }}
                >
                  <Box p={1}>
                    <img
                      style={{
                        width: "100%",
                        height: "350px",
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                      alt={news[0].name}
                      src={news[0].thumbnail}
                    />
                  </Box>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" color="#334862" fontWeight="900" mb={1}>
                      {news[0].name}
                    </Typography>
                    <Typography variant="body1" color="#334862" sx={{ whiteSpace: "nowrap" }}>
                      {new Date(news[0].createdAt).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box display={"flex"} flexDirection={"column"} justifyContent={"space-between"} gap={1.8}>
                {news.map((latestPost, index) => {
                  if (index === 0) return null;
                  return (
                    <Link key={index} component={RouterLink} to={`/thong-bao/${latestPost.slug}`} style={{ textDecoration: "none", cursor: "pointer" }}>
                      <Card
                        sx={{
                          borderRadius: 2,
                          p: 0.5,
                          border: "1px solid #f0f0f0",
                          transition: "transform 0.2s ease-in-out",
                          "&:hover": {
                            transform: "scale(1.02)",
                          },
                        }}
                      >
                        <Box display={"flex"} gap={"12px"} alignItems={"flex-start"} minHeight={"100px"} p={1}>
                          <Box display={"flex"} flexDirection={"column"} gap={"4px"}>
                            <Avatar
                              variant="rounded"
                              src={latestPost.thumbnail}
                              sx={{
                                width: "80px",
                                height: "80px",
                                objectFit: "cover",
                                borderRadius: 1,
                              }}
                            />
                          </Box>
                          <Box display={"flex"} flexDirection={"column"} gap={"8px"}>
                            <Typography variant="body2">{latestPost.name.length > 100 ? `${latestPost.name.substring(0, 100)}...` : latestPost.name}</Typography>
                            <Typography variant="body2" color="#334862" fontSize={"12px"} sx={{ whiteSpace: "nowrap" }}>
                              {new Date(latestPost.createdAt).toLocaleDateString("vi-VN", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
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
        sx={{
          backgroundColor: "#f5f5f5",
          width: "100vw",
          position: "relative",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "16px 0",
          my: "40px",
          "@media (max-width: 600px)": {
            marginTop: "16px",
            marginBottom: "16px",
            padding: "16px 0",
          },
        }}
      >
        <Box
          maxWidth={DESKTOP_WIDTH}
          m={"0 auto"}
          sx={{
            "@media (max-width: 600px)": {
              px: "16px",
            },
          }}
        >
          <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"} px={1}>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" color={"red"}>
              Dự án thiện nguyện
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "gray",
                display: "flex",
                fontWeight: "800",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => navigate("/tim-kiem")}
            >
              Xem tất cả
            </Typography>
          </Box>

          <Box px={1} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", my: 2 }}>
            <Box sx={{ width: 200 }}>
              <FormControl fullWidth size="small">
                <Select
                  value={projectTab.replace("/", "")}
                  onChange={(event) => setProjectTab(`/${event.target.value}`)}
                  displayEmpty
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "4px",
                    padding: 0,
                    margin: 0,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e0e0e0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#bdbdbd",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#bdbdbd",
                    },
                  }}
                >
                  <MenuItem disabled value="">
                    <em>Năm</em>
                  </MenuItem>
                  {PROJECT_LIST.children.map((child) => (
                    <MenuItem key={child.path} value={child.path.replace("/", "")}>
                      {child.title} {general?.category[child.path.replace("/", "")] && `(${general?.category[child.path.replace("/", "")]})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Tabs>
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
                    </TabPanel>
                  ))}
              </>
            )}
          </Tabs>
        </Box>
      </Box>
    </Box>
  );
}
