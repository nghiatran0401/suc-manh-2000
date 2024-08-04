import React, { useState, useEffect } from "react";
import { useMediaQuery, Box, Typography, Avatar, Grid, Breadcrumbs, Link, Button, CircularProgress } from "@mui/material";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
import { capitalizeEachWord, convertToYoutubeUrl } from "../helpers";
import EventIcon from "@mui/icons-material/Event";
import CarouselSlide from "../components/CarouselSlide";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { DESKTOP_WIDTH, HEADER_DROPDOWN_LIST, classificationMapping, statusMapping } from "../constants";
import { useTheme } from "@mui/material/styles";
import CarouselListCard from "./CarouselListCard";
import axios from "axios";
import { SERVER_URL } from "../constants";
import LoadingScreen from "./LoadingScreen";
import { provincesAndCities } from "../vietnam-provinces";

export default function CardDetails(props) {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const { post, latestPosts } = props;
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isProject = category.includes("du-an");

  useEffect(() => {
    setLoading(true);

    axios
      .get(SERVER_URL + `/${category}`)
      .then((postsResponse) => {
        setProjects(postsResponse.data.posts);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [category]);

  // function formatDate(date) {
  //   const d = new Date(date);
  //   const day = String(d.getDate()).padStart(2, "0");
  //   const month = String(d.getMonth() + 1).padStart(2, "0");
  //   const year = d.getFullYear();
  //   return `${day}/${month}/${year}`;
  // }

  if (loading) return <LoadingScreen />;
  return (
    <Box maxWidth={DESKTOP_WIDTH} m={"auto"} display={"flex"} flexDirection={"column"} gap={"16px"}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link sx={{ color: "#334862", textDecoration: "none" }} component={RouterLink} to="/">
          Trang chủ
        </Link>
        <Link sx={{ color: "#334862", textDecoration: "none" }} component={RouterLink} to={`/${category}`}>
          {HEADER_DROPDOWN_LIST.map((item) => {
            if (item.children.length > 0) {
              const foundChild = item.children.find((child) => child.path === `/${category}`);
              if (foundChild) {
                return foundChild.title;
              }
            }
            return null;
          })}
        </Link>
        <Typography color="textPrimary">{capitalizeEachWord(post.name)}</Typography>
      </Breadcrumbs>

      <Box display={"flex"} flexDirection={"column"} gap={"8px"} m={"16px 0"}>
        <Typography variant="h4" dangerouslySetInnerHTML={{ __html: capitalizeEachWord(post.name) }} />
        <Box display={"flex"} flexWrap={"wrap"} gap={"16px"} alignContent={"center"}>
          <Box display={"flex"} alignItems={"center"} gap={"8px"}>
            <Avatar sx={{ width: 32, height: 32 }}>{post.author.charAt(0)}</Avatar>
            <Typography variant="body1" dangerouslySetInnerHTML={{ __html: post.author }} />
          </Box>
          <Box display={"flex"} alignItems={"center"} gap={"8px"}>
            <EventIcon sx={{ width: 32, height: 32 }} />
            <Typography variant="body1" dangerouslySetInnerHTML={{ __html: post.publish_date.split("T")[0] }} />
          </Box>
          {post.classification && (
            <Typography variant="body2" sx={{ bgcolor: "rgb(41, 182, 246, 0.2)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
              {classificationMapping[post.classification]}
            </Typography>
          )}
          {post.status && (
            <Typography
              variant="body2"
              sx={{
                bgcolor: post.status === "can-quyen-gop" ? "rgba(255, 76, 48, 1)" : post.status === "dang-xay-dung" ? "rgba(255, 252, 150, 1)" : "rgba(210, 238, 130, 1)",
                p: "6px",
                width: "fit-content",
                borderRadius: "8px",
              }}
            >
              {statusMapping[post.status]}
            </Typography>
          )}
          {post.totalFund && (
            <Typography variant="body2" sx={{ bgcolor: "rgba(135, 211, 124, 1)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
              {post.totalFund > 0 ? post.totalFund.toLocaleString() : "Đang xử lý"}
            </Typography>
          )}
          {post["location.province"] && (
            <Typography variant="body2" sx={{ bgcolor: "rgba(237, 233, 157, 1)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
              {provincesAndCities.find((i) => i.provinceValue === post["location.province"])?.province ?? "Khác"}
            </Typography>
          )}
        </Box>
      </Box>

      {post?.donor && Object.keys(post?.donor).length > 0 && (
        <Box bgcolor={"#f1f1f1"}>
          <Box p={"24px"} display={"flex"} flexDirection={isMobile ? "column-reverse" : "row"} gap={"40px"}>
            <Typography
              color={"#77777"}
              variant="h6"
              dangerouslySetInnerHTML={{ __html: post.donor.description }}
              sx={{
                width: "100%", // Adjust the width as needed
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            />

            {post.donor.images.length === 1 && <img src={post.donor.images[0].image} alt={post.donor.name} style={{ width: isMobile ? "50%" : "25%", objectFit: "contain" }} />}

            {post.donor.images.length > 1 && (
              <img
                src={post.donor.images.find((i) => i.image.toLowerCase().includes("logo"))?.image ?? post.donor.images[0].image}
                alt={post.donor.name}
                style={{ width: isMobile ? "50%" : "25%", objectFit: "contain" }}
              />
            )}
          </Box>
        </Box>
      )}

      {post?.progress && post?.progress?.length > 0 && (
        <Grid container spacing={3} m={"16px 0px"} width={"100%"} display={"flex"} flexDirection={isMobile ? "column" : "row"}>
          {post?.progress?.map((progress, index) => (
            <Grid key={index} item xs={4} sx={{ p: "0px !important", maxWidth: "100%" }}>
              <CarouselSlide title={progress.name} items={progress.images} position="progress" />
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container sx={{ m: "16px 0px", flexDirection: { xs: "column-reverse", sm: "row" } }}>
        <Grid item xs={12} sm={9} p={"0px !important"}>
          <Box sx={{ maxWidth: "720px" }}>
            <Box display={"flex"} gap={"10px"}>
              {post.content.tabs.length === 1 &&
                post.content.tabs.map((tab, index) => (
                  <Box key={index} display={"flex"} flexDirection={"column"} gap={"16px"}>
                    <Typography variant="body1" style={{ wordWrap: "break-word" }} dangerouslySetInnerHTML={{ __html: tab.description.replace(/\n/g, "<br>") }} />

                    {tab.embedded_url?.length > 0 && (
                      <Box>
                        {tab.embedded_url?.map((url, index) => {
                          if (url.includes("momo")) {
                            return (
                              <Button href={url} target="_blank" variant="contained" sx={{ bgcolor: "#ed1c24" }}>
                                Quỹ Trái Tim Momo
                              </Button>
                            );
                          } else {
                            return (
                              <>
                                {isIframeLoading && (
                                  <Box display="flex" justifyContent="center">
                                    <CircularProgress />
                                  </Box>
                                )}
                                <iframe
                                  key={index}
                                  width="100%"
                                  height={tab.embedded_url.length === 1 ? "1000px" : "500px"}
                                  src={url.includes("youtube") ? convertToYoutubeUrl(url) : url}
                                  frameborder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowfullscreen
                                  onLoad={() => setIsIframeLoading(false)}
                                />
                              </>
                            );
                          }
                        })}
                      </Box>
                    )}

                    {tab.slide_show?.length > 0 && (
                      <Box maxWidth={"720px"}>
                        {tab.slide_show.map((img, idx) => (
                          <Box key={idx} display={"flex"} flexDirection={"column"} gap={"8px"} alignItems={"center"} m={"16px"}>
                            <img src={img.image} alt={img.caption} style={{ width: "100%", objectFit: "contain" }} />
                            <Typography variant="body2" color={"#77777"}>
                              {img.caption}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}

              {post.content.tabs.length > 1 && (
                <Tabs style={{ width: "100%" }}>
                  <TabList>
                    {post.content.tabs.map((tab, index) => (
                      <Tab key={index}>{tab.name}</Tab>
                    ))}
                  </TabList>

                  {post.content.tabs.map((tab, index) => (
                    <TabPanel key={index} style={{ marginTop: "50px", maxWidth: "720px", width: "100%" }}>
                      <Box display={"flex"} flexDirection={"column"} gap={"16px"}>
                        <Typography variant="body1" style={{ wordWrap: "break-word" }} dangerouslySetInnerHTML={{ __html: tab.description }} />

                        {tab.embedded_url?.length > 0 && (
                          <Box>
                            {tab.embedded_url?.map((url, index) => {
                              if (url.includes("momo")) {
                                return (
                                  <Button href={url} target="_blank" variant="contained" sx={{ bgcolor: "#ed1c24" }}>
                                    Quỹ Trái Tim Momo
                                  </Button>
                                );
                              } else {
                                return (
                                  <>
                                    {isIframeLoading && (
                                      <Box display="flex" justifyContent="center">
                                        <CircularProgress />
                                      </Box>
                                    )}
                                    <iframe
                                      key={index}
                                      width="100%"
                                      height={tab.embedded_url.length === 1 ? "1000px" : "500px"}
                                      src={url.includes("youtube") ? convertToYoutubeUrl(url) : url}
                                      frameborder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowfullscreen
                                      onLoad={() => setIsIframeLoading(false)}
                                    />
                                  </>
                                );
                              }
                            })}
                          </Box>
                        )}

                        {tab.slide_show?.length > 0 && (
                          <Box width={isMobile ? "auto" : "720px"}>
                            {/* <CarouselSlide items={tab.slide_show} /> */}
                            {tab.slide_show.map((img, idx) => (
                              <Box key={idx} display={"flex"} flexDirection={"column"} gap={"8px"} alignItems={"center"} m={"16px"}>
                                <img src={img.image} alt={img.caption.split(".")[0]} style={{ width: "100%", height: "auto" }} />
                                <Typography variant="body2" color={"#77777"}>
                                  {img.caption.split(".")[0]}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>

                      {tab.name === "Nhà hảo tâm" && !tab.description && (!tab.embedded_url || tab.embedded_url?.length === 0) && post?.donor && Object.keys(post?.donor).length > 0 && (
                        <Box display={"flex"} flexDirection={"column"} gap={"16px"}>
                          <Typography color={"#77777"} variant="h6" dangerouslySetInnerHTML={{ __html: post.donor.description }} />
                        </Box>
                      )}
                    </TabPanel>
                  ))}
                </Tabs>
              )}
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={3}>
          {post.description && (
            <Box display={"flex"} flexDirection={"column"} border={"1px solid #000"} borderRadius={"16px"} bgcolor={"#f1f1f1"} mb={"40px"} pb={"16px"}>
              <img
                style={{ width: "100%", height: "225px", objectFit: "fill", borderRadius: "16px 16px 0 0" }}
                alt={post.name}
                src={post.thumbnail ?? "https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png"}
              />

              <Typography padding={"16px"} variant="body2" color={"#77777"} textAlign={"center"} dangerouslySetInnerHTML={{ __html: post.description }} />

              <Box display={"flex"} flexWrap={"wrap"} gap={"8px"} m={"0px 8px"}>
                {post.totalFund && (
                  <Typography variant="body2" sx={{ bgcolor: "rgba(135, 211, 124, 1)", p: "6px", borderRadius: "8px", width: "fit-content" }}>
                    {post.totalFund > 0 ? post.totalFund.toLocaleString() : "Đang xử lý"}
                  </Typography>
                )}

                {post["location.province"] && (
                  <Typography variant="body2" sx={{ bgcolor: "rgba(237, 233, 157, 1)", p: "6px", borderRadius: "8px", width: "fit-content" }}>
                    {provincesAndCities.find((i) => i.provinceValue === post["location.province"])?.province ?? "Khác"}
                  </Typography>
                )}

                {/* {post.start_date  && (
                <Typography variant="body2" sx={{ display: "block", bgcolor: "rgba(213, 184, 255, 1)", p: "6px", m: "8px 24px", borderRadius: "8px" }}>
                  <strong>Ngày khởi công:</strong> {formatDate(post.start_date)}
                </Typography>
              )}
              {post.end_date && (
                <Typography variant="body2" sx={{ display: "block", bgcolor: "rgba(213, 184, 255, 1)", p: "6px", m: "8px 24px", borderRadius: "8px" }}>
                  <strong>Ngày khánh thành:</strong> {formatDate(post.end_date)}
                </Typography>
              )} */}
              </Box>
            </Box>
          )}

          {/* TODO: Refactor this as a reused component */}
          {!isMobile && (
            <Box position="sticky" top={80} zIndex={1} bgcolor="#fff" boxShadow={1} p={"16px 8px"} borderRadius={4}>
              <Typography variant="h6" fontWeight="bold" align="center">
                BÀI VIẾT MỚI NHẤT
              </Typography>
              <Box textAlign={"center"}>------</Box>
              <Box display="flex" flexDirection="column" gap={1}>
                {latestPosts.map((latestPost, index) => (
                  <Link
                    key={index}
                    component={RouterLink}
                    to={`/thong-bao/${latestPost.slug}`}
                    sx={{
                      textDecoration: "none",
                      cursor: "pointer",
                      color: "#334862",
                      ":hover": {
                        // textDecoration: "underline",
                        color: "#000",
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2} minHeight="56px" borderRadius={8} p={1}>
                      <Avatar variant="rounded" src={latestPost.image} sx={{ width: "50px", height: "50px", objectFit: "cover" }} />
                      <Typography variant="body2" sx={{ flex: 1, fontSize: "1rem", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {latestPost.name.length > 80 ? `${latestPost.name.substring(0, 80)}...` : latestPost.name}
                      </Typography>
                    </Box>
                  </Link>
                ))}
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>

      {isProject && (
        <Box m={"16px"}>
          <Typography variant="h5" fontWeight="bold" color={"red"}>
            Các dự án khác của năm 2024
          </Typography>

          <CarouselListCard posts={projects} category={category} />
        </Box>
      )}

      <Box display={"flex"} gap={isMobile ? "16px" : "40px"} justifyContent={"center"} width={"100%"}>
        <Button variant="contained" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Trở lại đầu trang
        </Button>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Quay lai trang trước
        </Button>
      </Box>
    </Box>
  );
}
