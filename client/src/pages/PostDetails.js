import React, { useState, useEffect } from "react";
import axios from "axios";
import { SERVER_URL } from "../constants";
import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import HeaderBar from "../components/Header";
import Companion from "../components/Companion";
import Footer from "../components/Footer";
import CarouselMembers from "../components/CarouselMembers";
import CardDetails from "../components/CardDetails";
import LoadingScreen from "../components/LoadingScreen";

export default function PostDetails() {
  const { category, id } = useParams();
  const [post, setPost] = useState({});
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    Promise.all([axios.get(SERVER_URL + `/${category}/${id}`), axios.get(SERVER_URL + `/thong-bao/getLatestPosts`)])
      .then(([postRes, latestPostsRes]) => {
        setPost(postRes.data);
        setLatestPosts(latestPostsRes.data);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [id]);

  if (!(Object.keys(post)?.length > 0 && latestPosts?.length > 0)) return <LoadingScreen />;
  return (
    <Box>
      <HeaderBar />

      {loading ? <LoadingScreen /> : <CardDetails post={post} latestPosts={latestPosts} />}
      <CarouselMembers />
      <Companion />
      <Footer />
    </Box>
  );
}
