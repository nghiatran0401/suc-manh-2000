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

  useEffect(() => {
    Promise.all([axios.get(SERVER_URL + "/" + category + "/" + id), axios.get(SERVER_URL + "/" + category + "/getLatestPosts")])
      .then(([postRes, latestPostsRes]) => {
        setPost(postRes.data.data);
        setLatestPosts(latestPostsRes.data.data);
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch((e) => console.error(e));
  }, [id]);

  if (!(Object.keys(post)?.length > 0 && latestPosts?.length > 0)) return <LoadingScreen />;
  return (
    <Box>
      <HeaderBar />

      <CardDetails post={post} latestPosts={latestPosts} />

      <CarouselMembers />
      <Companion />
      <Footer />
    </Box>
  );
}
