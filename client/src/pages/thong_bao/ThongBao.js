import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Pagination } from "@mui/material";
import { POSTS_PER_PAGE, SERVER_URL } from "../../constants";
import HeaderBar from "../../components/Header";
import Companion from "../../components/Companion";
import Footer from "../../components/Footer";
import CarouselMembers from "../../components/CarouselMembers";
import CardList from "../../components/CardList";

export default function ThongBao() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(SERVER_URL + "/thong-bao", { params: { page, POSTS_PER_PAGE } })
      .then((res) => {
        setPosts(res.data.data);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [page]);

  console.log("posts", posts);

  if (!posts || Object.keys(posts).length <= 0) return <></>;
  return (
    <Box>
      <HeaderBar />

      <CardList title="LƯU TRỮ DANH MỤC: THÔNG BÁO SỨC MẠNH 2000" posts={posts} loading={loading} />
      <Box display={"flex"} justifyContent={"center"} mt={"64px"}>
        <Pagination count={POSTS_PER_PAGE} page={page} onChange={(event, value) => setPage(value)} variant="outlined" shape="rounded" />
      </Box>

      <CarouselMembers />
      <Companion />
      <Footer />
    </Box>
  );
}
