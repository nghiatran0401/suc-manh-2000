import React, { useState, useEffect } from "react";
import axios from "axios";
import { SERVER_URL } from "../constants";
import { useParams } from "react-router-dom";
import { useMediaQuery, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CardDetails from "../components/CardDetails";
import LoadingScreen from "../components/LoadingScreen";

export default function PostDetails() {
  const { category, id } = useParams();
  const [post, setPost] = useState({});
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    Promise.all([axios.get(SERVER_URL + `/${category}/${id}`), axios.get(SERVER_URL + "/thong-bao", { params: { start: 0, end: 5 } })])
      .then(([postRes, latestPostsRes]) => {
        setPost(postRes.data);
        setLatestPosts(latestPostsRes.data.posts);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [id, category]);

  if (!(Object.keys(post)?.length > 0 && latestPosts?.length > 0)) return <LoadingScreen />;

  return <Box m={isMobile ? "24px 16px" : "24px auto"}>{loading ? <LoadingScreen /> : <CardDetails post={post} latestPosts={latestPosts} />}</Box>;
}
