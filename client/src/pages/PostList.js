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

export default function PostList() {
  const { category } = useParams();
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const title = ("Lưu trữ danh mục: " + findTitle(HEADER_DROPDOWN_LIST, "/" + category)).toUpperCase();

  useEffect(() => {
    setLoading(true);
    axios
      .get(SERVER_URL + "/" + category, { params: { page, POSTS_PER_PAGE } })
      .then((res) => {
        setPosts(res.data.data);
        setTotalPosts(res.data.totalPosts);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [page]);

  console.log("posts", { posts, totalPosts });

  if (!posts || Object.keys(posts).length <= 0 || !totalPosts) return <></>;
  return (
    <Box>
      <HeaderBar />

      <CardList title={title} posts={posts} loading={loading} showDescription={true} />
      {totalPosts > POSTS_PER_PAGE && (
        <Box display={"flex"} justifyContent={"center"} mt={"64px"}>
          <Pagination
            count={POSTS_PER_PAGE}
            page={page}
            onChange={(event, value) => {
              setPage(value);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            variant="outlined"
            shape="rounded"
          />
        </Box>
      )}

      <CarouselMembers />
      <Companion />
      <Footer />
    </Box>
  );
}
