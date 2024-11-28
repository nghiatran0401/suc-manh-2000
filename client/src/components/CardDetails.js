import React, { useState, useEffect } from "react";
import { useMediaQuery, Box, Typography, Avatar, Grid, Breadcrumbs, Link, Button, CircularProgress } from "@mui/material";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
import { standardizeString, convertToYoutubeUrl } from "../helpers";
import CarouselSlide from "../components/CarouselSlide";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { DESKTOP_WIDTH, HEADER_DROPDOWN_LIST, categoryMapping, classificationMapping, iconMapping, metadataMapping, statusLogoMapping, statusMapping } from "../constants";
import { useTheme } from "@mui/material/styles";
import CarouselListCard from "./CarouselListCard";
import axios from "axios";
import { SERVER_URL } from "../constants";
import LoadingScreen from "./LoadingScreen";
import SM2000 from "../assets/companions/SM2000.svg";
import WalletIcon from "../assets/wallet.png";
import StudentIcon from "../assets/student.png";

export default function CardDetails(props) {
  const { category } = useParams();
  const navigate = useNavigate();
  const { post, latestPosts } = props;
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isProject = category.includes("du-an");
  const [finalProgress, setFinalProgress] = useState(post.progressNew || post.progress);
  const [finalTabs, setFinalTabs] = useState(post.contentNew || post.content);

  useEffect(() => {
    setLoading(true);

    axios
      .get(SERVER_URL + `/${category}`)
      .then((postsResponse) => {
        setProjects(postsResponse.data.posts);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "instant" });
        }, 200);
      })
      .catch((e) => console.error(e));
  }, [category]);

  const IframeComponent = ({ tab }) => {
    const [iframeStatus, setIframeStatus] = useState("loading");

    if (!tab.description) {
      return <></>;
    } else {
      return (
        <>
          {iframeStatus === "loading" && (
            <Box display="flex" justifyContent="center" alignItems="center" gap={"8px"} mb={"16px"}>
              <CircularProgress size={18} />
              Đang tải nội dung
            </Box>
          )}
          <iframe
            title={tab.name}
            width="100%"
            height={"1000px"}
            src={tab.description}
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            onLoad={() => setIframeStatus("loaded")}
            onError={() => setIframeStatus("error")}
            style={{
              border: "2px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </>
      );
    }
  };

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
        <Typography color="textPrimary">{standardizeString(post.name)}</Typography>
      </Breadcrumbs>

      <Box display={"flex"} flexDirection={"column"} gap={"8px"} m={"16px 0"}>
        <Typography variant="h5" fontWeight="bold" dangerouslySetInnerHTML={{ __html: standardizeString(post.name) }} />

        <Box display={"flex"} flexWrap={"wrap"} gap={"16px"} alignContent={"center"} mt={"16px"}>
          {!isProject && (
            <Typography variant="body2" fontWeight={600} sx={{ bgcolor: "rgb(160, 160, 160, 0.2)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
              {new Date(post.createdAt).toLocaleDateString("vi-VN")}
            </Typography>
          )}
          {!isProject && (
            <Typography variant="body2" fontWeight={600} sx={{ bgcolor: "rgb(41, 182, 246, 0.2)", p: "6px", width: "fit-content", borderRadius: "8px" }}>
              {post.author}
            </Typography>
          )}
          {post.classification && (
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                bgcolor: "rgb(41, 182, 246, 0.2)",
                p: "6px",
                width: "fit-content",
                borderRadius: "8px",
              }}
            >
              {classificationMapping[post.classification]}
            </Typography>
          )}
          {post.status !== undefined && (
            <Box
              display="flex"
              alignItems="center"
              sx={{
                bgcolor: post.status === "can-quyen-gop"
                  ? "rgba(255, 102, 102, 1)"
                  : post.status === "dang-xay-dung"
                  ? "rgba(255, 252, 150, 1)"
                  : "rgba(210, 238, 130, 1)",
                p: "6px",
                borderRadius: "8px",
                width: "fit-content",
              }}
            >
              {/* Display the image icon */}
              {statusLogoMapping[post.status] && (
                <img
                  src={statusLogoMapping[post.status]}
                  alt={post.status}
                  style={{
                    width: "24px",
                    height: "24px",
                    marginRight: "8px",
                    borderRadius: "50%",
                  }}
                />
              )}
              {/* Display the text */}
              <Typography variant="body2" fontWeight={600}>
                {statusMapping[post.status]}
              </Typography>
            </Box>
          )}
          {Boolean(post.totalFund) && (
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                bgcolor: "rgba(135, 211, 124, 1)",
                p: "6px",
                width: "fit-content",
                borderRadius: "8px",
              }}
            >
              {post.totalFund > 0 ? Number(post.totalFund).toLocaleString() + " VND" : "Đang xử lý"}
            </Typography>
          )}
          {post.location?.province && (
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                bgcolor: "rgba(255, 153, 204, 1)",
                p: "6px",
                width: "fit-content",
                borderRadius: "8px",
              }}
            >
              {post.location?.province}
            </Typography>
          )}
        </Box>
      </Box>

      {isProject && post.donor?.description ? (
        <Box bgcolor={"#f1f1f1"} p={"24px"}>
          <Box display={"flex"} flexDirection={isMobile ? "column-reverse" : "row"} gap={"16px"}>
            <Typography
              width={isMobile ? "100%" : "80%"}
              color={"#77777"}
              variant="h6"
              dangerouslySetInnerHTML={{ __html: post.donor.description }}
              sx={{
                width: "100%",
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            />

            <Box display="flex" flexWrap={"wrap"} width={isMobile ? "100%" : "20%"} gap={"16px"}>
              {post.donor.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.image}
                  alt={post.donor.name}
                  style={{
                    width: isMobile ? "40%" : "80%",
                    objectFit: "contain",
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      ) : (
        isProject &&
        post.status === "can-quyen-gop" &&
        !post.donor?.description && (
          <Box bgcolor={"#f1f1f1"} p={"24px"} display={"flex"} alignItems={"center"} justifyContent={"center"}>
            <Typography variant="h6" textAlign={"center"}>
              Hiện chưa có nhà tài trợ. <br />
              Liên hệ tài trợ hoặc nhận thêm thông tin về dự án này vui lòng liên hệ: 0975302307 - Hoàng Hoa Trung
            </Typography>
          </Box>
        )
      )}

      {finalProgress && finalProgress?.length > 0 && (
        <Grid container spacing={3} m={"16px 0px"} width={"100%"} display={"flex"} flexDirection={isMobile ? "column" : "row"}>
          {finalProgress?.map((progress, index) => (
            <Grid key={index} item xs={4} sx={{ p: "0px !important", maxWidth: "100%" }}>
              <Box display={"flex"} flexDirection={"column"} gap={"16px"} alignItems={"center"}>
                <Typography variant="h5" fontWeight="bold" m={"8px"}>
                  {progress.name === "Ảnh hiện trạng" && "Album hiện trạng"}
                  {progress.name === "Ảnh tiến độ" && "Album tiến độ"}
                  {progress.name === "Ảnh hoàn thiện" && "Album hoàn thiện"}
                </Typography>
                <CarouselSlide items={progress.images} />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      <Grid
        container
        sx={{
          m: "16px 0px",
          flexDirection: { xs: "column-reverse", sm: "row" },
        }}
      >
        <Grid item xs={12} sm={9} p={"0px !important"}>
          <Box sx={{ maxWidth: "720px" }}>
            <Box display={"flex"} gap={"10px"}>
              <Tabs style={{ width: "100%" }}>
                {finalTabs?.tabs?.length > 1 && <TabList>{finalTabs.tabs.map((tab, index) => tab.name !== "Mô hình xây" && <Tab key={index}>{tab.name}</Tab>)}</TabList>}

                {finalTabs.tabs.map((tab, index) => (
                  <TabPanel
                    key={index}
                    style={{
                      marginTop: isProject ? "50px" : "0px",
                      maxWidth: "720px",
                      width: "100%",
                    }}
                  >
                    <Box display={"flex"} flexDirection={"column"} gap={"16px"}>
                      {["du-an-2024", "du-an-2023", "du-an-2022"].includes(category) ? (
                        <Box display="flex" flexDirection={"column"} justifyContent="center" alignItems="center">
                          <IframeComponent tab={tab} />
                        </Box>
                      ) : (
                        <Typography
                          variant="body1"
                          sx={{
                            wordBreak: "break-word",
                            "& figure": { width: "auto !important" },
                            "& iframe": {
                              width: "-webkit-fill-available !important",
                            },
                            "& table": {
                              "& th, td": {
                                verticalAlign: "top",
                              },
                            },
                          }}
                          dangerouslySetInnerHTML={{ __html: tab.description }}
                        />
                      )}

                      {tab.slide_show?.length > 0 && (
                        <Box width={isMobile ? "auto" : "720px"}>
                          {tab.slide_show.map((img, idx) => (
                            <Box key={idx} display={"flex"} flexDirection={"column"} gap={"8px"} alignItems={"center"} m={"16px"}>
                              <img src={img.image} alt={img.caption?.includes(".jpg") ? img.caption.split(".jpg")[0] : img.caption} style={{ width: "100%", height: "auto" }} />
                              <Typography variant="body2" color={"#77777"}>
                                {img.caption?.includes(".jpg") ? img.caption.split(".jpg")[0] : img.caption}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>

                    {tab.name === "Nhà hảo tâm" && !tab.description && (!tab.embedded_url || tab.embedded_url?.length === 0) && post?.donor && Object.keys(post?.donor).length > 0 && (
                      <Box display={"flex"} flexDirection={"column"} gap={"16px"}>
                        <Typography
                          color={"#77777"}
                          variant="h6"
                          dangerouslySetInnerHTML={{
                            __html: post.donor.description,
                          }}
                        />
                      </Box>
                    )}
                  </TabPanel>
                ))}
              </Tabs>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={3}>
          {isProject && (
            <Box
              display={"flex"}
              flexDirection={"column"}
              border={"1px solid #000"}
              borderRadius={"16px"}
              bgcolor={"#f1f1f1"}
              mb={"40px"}
              pb={"16px"}
              gap={"16px"}
              sx={{
                width: "100%",
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              <img
                style={{
                  objectFit: "contain",
                  objectPosition: "center",
                  borderRadius: "16px 16px 0 0",
                }}
                alt={post.name}
                src={post.thumbnail ? post.thumbnail : SM2000}
              />
              <Typography
                variant="body1"
                fontWeight={"bold"}
                textAlign={"center"}
                p={"0 8px"}
                dangerouslySetInnerHTML={{
                  __html: standardizeString(post.name),
                }}
              />

              <Box display={"flex"} flexDirection={"column"} gap={"8px"} p={"8px 16px"}>
                {post.metadata &&
                  Object.entries(post.metadata)
                    .sort(([keyA], [keyB]) => {
                      const order = [
                        "stage",
                        "constructionItems",
                        "progress",
                        "type",
                        "totalStudents",
                        "totalClassrooms",
                        "totalPublicAffairsRooms",
                        "totalToilets",
                        "totalRooms",
                        "totalKitchens",
                        "start_date",
                        "end_date",
                      ];
                      return order.indexOf(keyA) - order.indexOf(keyB);
                    })
                    .map(
                      ([key, value], index) =>
                        metadataMapping[key] &&
                        value && (
                          <>
                            <Typography 
                              key={index} 
                              variant="body1" 
                              color={"#77777"}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                width: "100%"
                              }}
                            >
                              {["start_date", "end_date"].includes(key) ? (
                                <>
                                  <span style={{ fontWeight: "bold" }}>{metadataMapping[key]}</span>: {new Date(value).toLocaleDateString("vi-VN")}
                                </>
                              ) : (
                                <>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <img
                                      src={iconMapping[key] ?? StudentIcon}
                                      alt={post.status}
                                      style={{
                                        width: "24px",
                                        height: "24px",
                                        marginRight: "8px",
                                        borderRadius: "50%",
                                      }}
                                    />
                                    <span>{metadataMapping[key]}</span>
                                  </div>
                                  <div style={{ textAlign: "right" }}>
                                    <span style={{ fontWeight: "bold" }}>{value}</span>
                                  </div>                                
                                </>
                              )}
                            </Typography>
                            <hr/>
                          </>
                        )
                    )}

                {post.location?.distanceToHN && (
                  <Typography variant="body1" color={"#77777"}>
                    <span style={{ fontWeight: "bold" }}>Cách Hà Nội</span>: {post.location?.distanceToHN} km
                  </Typography>
                )}
                {post.location?.distanceToHCMC && (
                  <Typography variant="body1" color={"#77777"}>
                    <span style={{ fontWeight: "bold" }}>Cách TP Hồ Chí Minh</span>: {post.location?.distanceToHCMC} km
                  </Typography>
                )}
                {Boolean(post.totalFund) && (
                  <Typography 
                    variant="body1" 
                    color={"#77777"} 
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={WalletIcon}
                        alt={post.status}
                        style={{
                          width: "24px",
                          height: "24px",
                          marginRight: "8px",
                          borderRadius: "50%",
                        }}
                      />
                      <span>Tổng tiền</span>
                    </div> 

                    <div style={{ textAlign: "right" }}>
                      <span style={{ color: "#F5222D" }}>
                        {post.totalFund > 0 ? " " + Number(post.totalFund).toLocaleString() + " VNĐ" : "Đang xử lý"}
                      </span>
                    </div>
                  </Typography>
                )}
                <hr/>
                {post.donors?.length > 0 && (
                  <Typography variant="body1" color={"#77777"}>
                    <span>Nhà hảo tâm </span>
                    <span style={{ fontWeight: "bold" }}>
                      {post.donors.map((donor) => donor.name).join(", ")}
                    </span>
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {!isMobile && (
            <Box position="sticky" top={80} zIndex={1} bgcolor="#fff" boxShadow={1} p={"16px 8px"} borderRadius={4}>
              <Typography variant="h6" fontWeight="bold" align="center">
                THÔNG BÁO MỚI NHẤT
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
                      ":hover": { color: "#000" },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2} minHeight="56px" borderRadius={8} p={1}>
                      <Avatar
                        variant="rounded"
                        src={latestPost.thumbnail ? latestPost.thumbnail : "https://web.sucmanh2000.com/static/media/logo-header.98d4636d9bfeb88f95d4.png"}
                        sx={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {latestPost.name
                          .replace(/Dự án Sức mạnh 2000|ngày/g, "")
                          .trim()
                          .replace(/^\w/, (c) => c.toUpperCase())}{" "}
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
          <Typography variant="h5" fontWeight="bold" color={"red"} mb={"8px"}>
            {categoryMapping[category]} khác
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
