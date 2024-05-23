import React, { useState, useEffect } from "react";
import axios from "axios";
import { SERVER_URL } from "../constants";
import { useParams } from "react-router-dom";
import { Box, LinearProgress } from "@mui/material";
import HeaderBar from "../components/Header";
import Companion from "../components/Companion";
import Footer from "../components/Footer";
import CarouselMembers from "../components/CarouselMembers";
import CardDetails from "../components/CardDetails";

export default function PostDetails() {
  const { category, id } = useParams();
  const [post, setPost] = useState({});
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([axios.get(SERVER_URL + "/" + category + "/" + id), axios.get(SERVER_URL + "/" + category + "/getLatestPosts")])
      .then(([postRes, latestPostsRes]) => {
        setPost(postRes.data.data);
        setLatestPosts(latestPostsRes.data.data);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [id]);

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
