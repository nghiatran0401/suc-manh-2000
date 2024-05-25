const express = require("express");
const fs = require("fs");

const postRouter = express.Router({ mergeParams: true });

// Get a list of posts
postRouter.get("/", (req, res) => {
  const { category } = req.params;
  let database;
  if (category.includes("du-an")) {
    database = fs.readFileSync("../server/transformed_pages.json", "utf8");
  } else {
    database = fs.readFileSync("../server/transformed_posts.json", "utf8");
  }

  const data = JSON.parse(database).sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));
  const filteredData = data.filter((item) => item.category === category);

  const page = Number(req.query.page) || 1;
  const postsPerPage = Number(req.query.postsPerPage) || 12;
  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;

  const slicedData = filteredData.slice(startIndex, endIndex);

  if (slicedData.length > 0) {
    res.status(200).send({ data: slicedData, totalPosts: filteredData.length });
  } else {
    res.status(404).send({ error: "No posts found for this page" });
  }
});

// Get a list of 5 latest posts
postRouter.get("/getLatestPosts", (req, res) => {
  const { category } = req.params;
  let database;
  if (category.includes("du-an")) {
    database = fs.readFileSync("../server/transformed_pages.json", "utf8");
  } else {
    database = fs.readFileSync("../server/transformed_posts.json", "utf8");
  }

  const data = JSON.parse(database);
  const filteredData = data.filter((item) => item.category === category);

  // const sortedData = filteredData.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));
  const latestPosts = filteredData
    .slice(0, 5)
    .map((post) => ({
      name: post.name,
      author: post.author,
      publish_date: post.publish_date,
      slug: post.slug,
      image: post.content.tabs[0].slide_show[0]?.image ?? "https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png",
    }));

  if (latestPosts.length > 0) {
    res.status(200).send({ data: latestPosts });
  } else {
    res.status(404).send({ error: "No posts found for this page" });
  }
});

// Get a single detailed post
postRouter.get("/:id", (req, res) => {
  const { category, id } = req.params;
  let database;
  if (category.includes("du-an")) {
    database = fs.readFileSync("../server/transformed_pages.json", "utf8");
  } else {
    database = fs.readFileSync("../server/transformed_posts.json", "utf8");
  }

  const data = JSON.parse(database);
  const matchingPost = data.find((post) => post.slug === id);

  if (matchingPost) {
    res.status(200).send({ data: matchingPost });
  } else {
    res.status(404).send({ error: "Post not found" });
  }
});

module.exports = postRouter;
