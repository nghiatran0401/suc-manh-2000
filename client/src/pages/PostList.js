import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Pagination } from "@mui/material";
import { useParams } from "react-router-dom";
import { POSTS_PER_PAGE, SERVER_URL, HEADER_DROPDOWN_LIST } from "../constants";
import HeaderBar from "../components/Header";
import Companion from "../components/Companion";
import Footer from "../components/Footer";
import CarouselMembers from "../components/CarouselMembers";
import CardList from "../components/CardList";
import { findTitle } from "../helpers";
import LoadingScreen from "../components/LoadingScreen";

export default function PostList() {
  const { category } = useParams();
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState({});
  const [page, setPage] = useState(1);
  const title = ("Lưu trữ danh mục: " + findTitle(HEADER_DROPDOWN_LIST, "/" + category)).toUpperCase();

  useEffect(() => {
    const startData = (page - 1) * POSTS_PER_PAGE;
    const endData = startData + POSTS_PER_PAGE;

    axios
      .get(SERVER_URL + "/" + category, { params: { _start: startData, _end: endData } })
      .then((posts) => {
        setTotalPosts(posts.headers["x-total-count"]);
        setPosts(posts.data);
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch((e) => console.error(e));
  }, [page, category]);

  if (posts?.length <= 0) return <LoadingScreen />;
  return (
    <Box>
      <HeaderBar />

      <CardList title={title} posts={posts} showDescription={false} />
      {totalPosts > POSTS_PER_PAGE && (
        <Box display={"flex"} justifyContent={"center"} mt={"64px"}>
          <Pagination count={POSTS_PER_PAGE} page={page} onChange={(event, value) => setPage(value)} variant="outlined" shape="rounded" />
        </Box>
      )}

      <CarouselMembers />
      <Companion />
      <Footer />
    </Box>
  );
}
