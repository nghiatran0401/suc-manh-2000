import React from "react";
import { Box, Typography, Grid, Card, CardContent, CardMedia } from "@mui/material";

const SponsoredProjects = () => {
  const projects = Array(5).fill({
    title: "DAD018 - Điểm trường Huổi Ún...",
    location: "Mường Pồn, Mường Chà, Điện Biên",
    date: "1 tháng trước",
    amount: "40.000.000 VNĐ",
    image: "https://via.placeholder.com/300",
  });

  return (
    <Box component="section" py={3}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Các dự án đã tài trợ
      </Typography>
      <Grid container spacing={3}>
        {projects.map((project, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ display: "flex", gap: 2, alignItems: "center", p: 2, border: "1px solid #ccc" }}>
              <CardMedia
                component="img"
                sx={{ width: 100, height: 100, borderRadius: "8px" }}
                image={project.image}
                alt="Project"
              />
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {project.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {project.location}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {project.date}
                </Typography>
                <Typography variant="body1" fontWeight="bold" mt={1}>
                  {project.amount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SponsoredProjects;
