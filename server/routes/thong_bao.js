const express = require("express");
const fs = require("fs");

const thongBaoRouter = express.Router();

// Get a list of posts
thongBaoRouter.get("/", (req, res) => {
  const jsonData = fs.readFileSync("../server/transformed_posts.json", "utf8");
  const data = JSON.parse(jsonData);
  // .sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date))
  const filteredData = data.filter((item) => item.category === "tien-do-xay-dung");

  const page = Number(req.query.page) || 1;
  const postsPerPage = Number(req.query.postsPerPage) || 12;
  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;

  const slicedData = filteredData.slice(startIndex, endIndex);

  if (slicedData.length > 0) {
    res.status(200).send({ data: slicedData });
  } else {
    res.status(404).send({ error: "No posts found for this page" });
  }
});

// Get a list of 5 latest posts
thongBaoRouter.get("/getLatestPosts", (req, res) => {
  const jsonData = fs.readFileSync("../server/transformed_posts.json", "utf8");
  const data = JSON.parse(jsonData);

  const sortedData = data.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));
  const latestPosts = sortedData.slice(0, 5).map((post) => ({ name: post.name, author: post.author, slug: post.slug, image: post.content.tabs[0].slide_show[0].image }));

  res.status(200).send({ data: latestPosts });
});

// Get a single detailed post
thongBaoRouter.get("/:id", (req, res) => {
  const jsonData = fs.readFileSync("../server/transformed_posts.json", "utf8");
  const { id } = req.params;
  const data = JSON.parse(jsonData);
  const matchingPost = data.find((post) => post.slug === id);

  if (matchingPost) {
    res.status(200).send({ data: matchingPost });
  } else {
    res.status(404).send({ error: "Post not found" });
  }
});

module.exports = thongBaoRouter;
