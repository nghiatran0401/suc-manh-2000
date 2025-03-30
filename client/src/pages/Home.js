import React, { useState, useEffect } from "react";
import axios from "axios";
import { DESKTOP_WIDTH, HEADER_DROPDOWN_LIST, SERVER_URL } from "../constants";
import { useMediaQuery, Box, Typography, Grid, Card, Link, CardContent, Avatar, LinearProgress, Divider, FormControl, Select, MenuItem } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import CountUp from "react-countup";
import { Tabs, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import CarouselListCard from "../components/CarouselListCard";
import constructionIcon from "../assets/construction.svg";
import peopleIcon from "../assets/people.svg";
import {} from "../helpers";

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
      {/* gioi thieu du an */}
      <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={"16px"} p={isMobile ? "24px 16px" : "40px 0"} alignItems="center">
        <Box display={"flex"} flexDirection={"column"} justifyContent={"center"} width={isMobile ? "100%" : "50%"} >
          <Typography variant="h6" color={"red"} textAlign={"left"} mt={5} mb={5}>
            GIỚI THIỆU
          </Typography>
          <Typography variant="h3" fontWeight="bold" color={"black"} textAlign={"left"}>
            Dự Án Sức Mạnh 2000
          </Typography>
          <Typography variant="h6" textAlign={"left"} p={isMobile ? "8px 0" : "8px 0"}>
            Mục tiêu cùng cộng đồng xóa TOÀN BỘ điểm trường gỗ, tôn tạm bợ trên TOÀN QUỐC.
            <br />
            Xây dựng đủ Khu nội trú, Cầu đi học, và Nhà hạnh phúc.
          </Typography>
          <Box mt={2}>
            <Companion />
          </Box>
        </Box>
        <Box width={isMobile ? "100%" : "50%"} display="flex" justifyContent="center">
          <img 
            src="#" 
            alt="Dự án Sức Mạnh 2000" 
            style={{ 
              width: "100%", 
              maxHeight: "400px", 
              objectFit: "cover", 
              borderRadius: "8px" 
            }} 
          />
        </Box>
      </Box>

      {/* Thống kê bên trái */}
      <Box display="flex" flexDirection="column"  width={isMobile ? "100%" : "40%"} mb={isMobile ? 4 : 5} >
        <Typography variant="h6" fontWeight="bold" color="black" textAlign="left" mb={1}>
          Bản đồ các công trình dự án ánh sáng núi rừng - SỨC MẠNH 2000
        </Typography>
        <Typography variant="body1" color="gray" textAlign="left" mb={2}>
          Tính từ 2012 đến tháng 3/2025
        </Typography>
      </Box>

      <Box 
          display="flex" 
          flexDirection="column" 
          bgcolor="#FFF1F0" 
          p={"24px"} 
          borderRadius={2} 
          width={isMobile ? "100%" : "30%"} 
          mb={isMobile ? 3 : 0}
        >
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
              <Typography fontWeight="bold" textAlign="left">424 - TRƯỜNG HỌC</Typography>
            </Box>
            
            <Box display="flex" alignItems="center" justifyContent="left">              
              <Typography fontWeight="bold" textAlign="left">211 - NHÀ HẠNH PHÚC</Typography>
            </Box>
            
            <Box display="flex" alignItems="center" justifyContent="left">              
              <Typography fontWeight="bold" textAlign="left">21 - KHU NỘI TRÚ</Typography>
            </Box>
            
            <Box display="flex" alignItems="center" justifyContent="left">              
              <Typography fontWeight="bold" textAlign="left">66 - CẦU ĐI HỌC</Typography>
            </Box>
          </Box>
        </Box>
      
      {/* Projects Statistics */}
      <Box display="flex" flexDirection={"column"} gap={"16px"} p={isMobile ? "24px 16px" : "40px"}>
        <Box display={"flex"} flexDirection={isMobile ? "column" : "row"} gap={"16px"}>
          {/* Box 1: Tổng dự án đã thực hiện */}
          <Box 
            display={"flex"} 
            flexDirection={"column"} 
            alignItems={"center"}
            bgcolor="#FFF1F0"
            p={4}
            borderRadius={2}
            width={isMobile ? "100%" : "50%"}
          >
            <img src={constructionIcon} alt="construction" style={{ width: "100px", height: "100px" }} />
            <Typography variant="h2" fontWeight={"bold"} color={"red"}>
              <CountUp start={0} end={totalFinishedProjects} duration={10} />
            </Typography>
            <Typography variant="h6" fontWeight={"bold"}>
              TỔNG DỰ ÁN ĐÃ THỰC HIỆN
            </Typography>
          </Box>

          {/* Box 2: Tổng số học sinh hưởng lợi */}
          <Box 
            display={"flex"} 
            flexDirection={"column"} 
            alignItems={"center"}
            bgcolor="#FFF1F0"
            p={4}
            borderRadius={2}
            width={isMobile ? "100%" : "50%"}
          >
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

      
      <Box display={"flex"} flexDirection={"column"} gap={"24px"} m={isMobile ? "24px 16px" : "24px auto"}>
        <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
          <Typography variant="h5" fontWeight="bold" color={"black"}>
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
                        height: "400px",
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
                        <Box
                          display={"flex"}
                          gap={"12px"}
                          alignItems={"flex-start"}
                          minHeight={"100px"}
                          p={1}
                        >
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
                            <Typography variant="body2" color="#334862" fontSize={"12px"} sx={{ whiteSpace: "nowrap" }}>
                              {new Date(latestPost.createdAt).toLocaleDateString("vi-VN", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </Typography>
                          </Box>
                          <Box display={"flex"} flexDirection={"column"} gap={"8px"}>
                            <Typography variant="body2" color="#334862" fontWeight={"900"}>
                              {latestPost.name.length > 100 ? `${latestPost.name.substring(0, 100)}...` : latestPost.name}
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
        display={"flex"}
        flexDirection={"column"}
        gap={"24px"}
        sx={{
          backgroundColor: "#f5f5f5",
          width: "100vw",
          position: "relative",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "50px 0",
          marginTop: "80px",
          marginBottom: "80px",
          "@media (max-width: 600px)": {
            marginTop: "16px",
            marginBottom: "16px",
            padding: "16px 0",
          },
        }}
      >
        <Box
          maxWidth={DESKTOP_WIDTH}
          width={"100%"}
          m={"0 auto"}
          px={"24px"}
          sx={{
            "@media (max-width: 600px)": {
              px: "16px",
            },
          }}
        >
          <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
            <Typography variant="h5" fontWeight="bold" color={"black"}>
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
              onClick={() => navigate("/search")}
            >
              {isMobile ? "Tất cả" : "Xem tất cả"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, mt: 3 }}>
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
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#bdbdbd'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#bdbdbd'
                    }
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
