import React, { useState } from "react";
import { Box, Typography, Avatar, Grid, Breadcrumbs, Link, Button, CircularProgress } from "@mui/material";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
import { convertToYoutubeUrl } from "../helpers";
import EventIcon from "@mui/icons-material/Event";
import CarouselSlide from "../components/CarouselSlide";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { HEADER_DROPDOWN_LIST } from "../constants";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function CardDetails(props) {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const { post, latestPosts } = props;
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box  maxWidth={"1080px"} m={"auto"} display={"flex"} flexDirection={"column"} gap={"16px"} 
     sx={{ mt: { xs: "0", md: "64px" } }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mt: "32px" }}>
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
        <Typography color="textPrimary">{post.name}</Typography>
      </Breadcrumbs>

      <Box display={"flex"} flexDirection={"column"} gap={"8px"} m={"16px 0"}>
        <Typography variant="h4" dangerouslySetInnerHTML={{ __html: post.name }} />
        <Box display={"flex"} gap={"24px"}>
          <Box display={"flex"} alignItems={"center"} gap={"8px"}>
            <Avatar sx={{ width: 32, height: 32 }}>{post.author.charAt(0)}</Avatar>
            <Typography variant="body1" dangerouslySetInnerHTML={{ __html: post.author }} />
          </Box>
          <Box display={"flex"} alignItems={"center"} gap={"8px"}>
            <EventIcon sx={{ width: 32, height: 32 }} />
            <Typography variant="body1" dangerouslySetInnerHTML={{ __html: post.publish_date.split("T")[0] }} />
          </Box>
        </Box>
      </Box>

      {post?.donor && Object.keys(post?.donor).length > 0 && (
        <Box bgcolor={"#f1f1f1"}>
          <Box p={"24px"} display={"flex"} gap={"40px"}>
            <Typography color={"#77777"} variant="h6" dangerouslySetInnerHTML={{ __html: post.donor.description }} />

            {post.donor.images.length === 1 && <img src={post.donor.images[0].image} alt={post.donor.name} style={{ width: "25%", objectFit: "contain" }} />}

            {post.donor.images.length > 1 && (
              <img src={post.donor.images.find((i) => i.image.toLowerCase().includes("logo"))?.image ?? post.donor.images[0].image} alt={post.donor.name} style={{ width: "20%", objectFit: "contain" }} />
            )}
          </Box>
        </Box>
      )}

      {post?.progress && post?.progress?.length > 0 && (
        <Grid container spacing={3} sx={{ m: "16px 0px" }}>
          {post?.progress?.map((progress, index) => (
            <Grid item xs={4} p={"0px !important"}>
              <CarouselSlide key={index} title={progress.name} items={progress.images} position="progress" />
            </Grid>
          ))}
        </Grid>
      )}

      <Grid item xs={12} md={6} sx={{ m: "16px 0px" }}>   
        <Grid item xs={9} p={"0px !important"}>
          <Box sx={{ wordWrap: "break-word" }}>
            <Box display={"flex"} gap={"10px"}>
              {post.content.tabs.length === 1 &&
                post.content.tabs.map((tab, index) => (
                  <Box display={"flex"} flexDirection={"column"} gap={"16px"}>
                    <Typography key={index} variant="body1" maxWidth={"720px"} dangerouslySetInnerHTML={{ __html: tab.description.replace(/\n/g, "<br>") }} />

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
                          <Box display={"flex"} flexDirection={"column"} gap={"8px"} alignItems={"center"} m={"16px"}>
                            <img key={idx} src={img.image} alt={img.caption.split(".")[0]} style={{ width: "100%", objectFit: "contain" }} />
                            <Typography variant="body2" color={"#77777"}>
                              {img.caption.split(".")[0]}
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
                    <TabPanel key={index} style={{ marginTop: "50px", maxWidth: "800px", width: "100%" }}>
                      <Box display={"flex"} flexDirection={"column"} gap={"16px"}>
                        <Box key={index} maxWidth={"720px"} style={{ wordWrap: "break-word" }}>
                          <Typography variant="body1" dangerouslySetInnerHTML={{ __html: tab.description }} />
                        </Box>

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
                          <Box width={"720px"}>
                            {/* <CarouselSlide items={tab.slide_show} /> */}
                            {tab.slide_show.map((img, idx) => (
                              <Box display={"flex"} flexDirection={"column"} gap={"8px"} alignItems={"center"} m={"16px"}>
                                <img key={idx} src={img.image} alt={img.caption.split(".")[0]} style={{ width: "100%", height: "auto" }} />
                                <Typography variant="body2" color={"#77777"}>
                                  {img.caption.split(".")[0]}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>

                      {tab.name === "Nhà hảo tâm" && !tab.description && tab.embedded_url?.length === 0 && post?.donor && Object.keys(post?.donor).length > 0 && (
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

        <Grid item xs={3}>
          {post.description && (
            <Box display={"flex"} flexDirection={"column"} border={"1px solid #000"} borderRadius={"16px"} bgcolor={"#f1f1f1"} mb={"40px"}>
              <img
                style={{ width: "100%", height: "225px", objectFit: "contain", borderRadius: "16px 16px 0 0" }}
                alt={post.name}
                src={post.thumbnail ?? "https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png"}
              />
              <Typography padding={"16px"} variant="body2" color={"#77777"} textAlign={"center"} dangerouslySetInnerHTML={{ __html: post.description }} />
            </Box>
          )}

          {/* TODO: Refactor this as a reused component */}
          <Box display={"flex"} flexDirection={"column"} gap={isMobile ? "8px" : "16px"}>
            <Typography variant="h6" fontWeight={"bold"}>
              BÀI VIẾT MỚI NHẤT
            </Typography>
            <Typography variant="h6">-----</Typography>
            {latestPosts.map((latestPost, index) => (
              <Link key={index} component={RouterLink} to={`/thong-bao/${latestPost.slug}`} style={{ textDecoration: "none", cursor: "pointer" }}>
                <Box display={"flex"} gap={"8px"} alignItems={"center"} minHeight={isMobile ? "40px" : "56px"}>
                  <Avatar variant="rounded" src={latestPost.image} style={{ width: isMobile ? 30 : 50, height: isMobile ? 30 : 50 }} />
                  <Typography variant="body2" color="#334862" style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                    {latestPost.name.length > 100 ? `${latestPost.name.substring(0, 100)}...` : latestPost.name}
                  </Typography>
                </Box>
              </Link>
            ))}
          </Box>
        </Grid>
      </Grid>

      <Box display={"flex"} gap={"40px"} justifyContent={"center"} width={"100%"}>
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
