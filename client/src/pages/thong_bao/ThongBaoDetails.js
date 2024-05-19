import React, { useState, useEffect } from "react";
import axios from "axios";
import { ROUTES, SERVER_URL } from "../../constants";
import { useParams } from "react-router-dom";
import { Box, LinearProgress } from "@mui/material";
import { Link } from "react-router-dom";
import { convertToEmbedUrl } from "../../helpers";
import EventIcon from "@mui/icons-material/Event";
import CarouselSlide from "../../components/CarouselSlide";
import HeaderBar from "../../components/Header";
import Companion from "../../components/Companion";
import Footer from "../../components/Footer";
import CarouselMembers from "../../components/CarouselMembers";
import CardDetails from "../../components/CardDetails";

export default function ThongBaoDetails() {
  const { id: slug } = useParams();
  const [post, setPost] = useState({});
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([axios.get(SERVER_URL + ROUTES.thong_bao + `/${slug}`), axios.get(SERVER_URL + ROUTES.thong_bao + `/getLatestPosts`)])
      .then(([postRes, latestPostsRes]) => {
        setPost(postRes.data.data);
        setLatestPosts(latestPostsRes.data.data);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [slug]);

  console.log("post", post);
  console.log("latestPosts", latestPosts);

  if (!post || Object.keys(post).length <= 0) return <></>;
  return (
    <Box>
      <HeaderBar />

      {loading && (
        <Box sx={{ width: "100%", margin: "50px auto", width: "50%" }}>
          <LinearProgress />
        </Box>
      )}

      {!loading && <CardDetails post={post} latestPosts={latestPosts} />}

      <CarouselMembers />
      <Companion />
      <Footer />
    </Box>
  );
}
