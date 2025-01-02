import React from "react";
import { Box, Typography, List, ListItem, ListItemAvatar, ListItemText, Avatar } from "@mui/material";

const NttSideBar = () => {
  const posts = Array(5).fill({
    title: "Dự án SOS020 cập nhật tiến độ...",
    date: "23/12/2024",
    image: "https://via.placeholder.com/80",
  });

  return (
    <Box component="aside" p={2} bgcolor="#f9f9f9" borderRadius={2}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Bài viết mới nhất
      </Typography>
      <List>
        {posts.map((post, index) => (
          <ListItem key={index} alignItems="flex-start" sx={{ padding: 0, mb: 2 }}>
            <ListItemAvatar>
              <Avatar
                variant="rounded"
                src={post.image}
                alt="Post Thumbnail"
                sx={{ width: 50, height: 50 }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight="bold">
                  {post.title}
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="textSecondary">
                  {post.date}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default NttSideBar;
