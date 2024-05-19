import { Box, Typography, Avatar, Grid, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import { convertToEmbedUrl } from "../helpers";
import EventIcon from "@mui/icons-material/Event";
import CarouselSlide from "../components/CarouselSlide";

export default function CardDetails(props) {
  const { post, latestPosts } = props;

  return (
    <Box maxWidth={"1080px"} m={"auto"} display={"flex"} flexDirection={"column"} gap={"16px"}>
      <Box display={"flex"} flexDirection={"column"} gap={"8px"} m={"24px auto"}>
        <Typography variant="h4" dangerouslySetInnerHTML={{ __html: post.name }} />
        <Box display={"flex"} gap={"24px"}>
          <Box display={"flex"} alignItems={"center"} gap={"8px"}>
            <Avatar sx={{ width: 32, height: 32 }}>{post.author.charAt(0)}</Avatar>
            <Typography variant="body1" dangerouslySetInnerHTML={{ __html: post.author }} />
          </Box>
          <Box display={"flex"} alignItems={"center"} gap={"8px"}>
            <EventIcon sx={{ width: 32, height: 32 }} />
            <Typography variant="body1" dangerouslySetInnerHTML={{ __html: post.publish_date.split(" ")[0] }} />
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={8}>
          <Box>
            <Box display={"flex"} gap={"10px"}>
              {post.content.tabs.map((tab, index) => (
                <Box display={"flex"} flexDirection={"column"} gap={"16px"}>
                  <Typography key={index} variant="body1" dangerouslySetInnerHTML={{ __html: tab.description.replace(/\n/g, "<br>") }} />

                  {tab.embedded_url && (
                    <iframe
                      width="100%"
                      height="500"
                      src={convertToEmbedUrl(tab.embedded_url)}
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                    />
                  )}
                </Box>
              ))}
            </Box>

            <CarouselSlide items={post.content?.tabs[0]?.slide_show} />
          </Box>
        </Grid>

        <Grid item xs={4}>
          {/* TODO: Refactor this as a reused component */}
          <Box display={"flex"} flexDirection={"column"} gap={"16px"}>
            <Typography variant="h6" fontWeight={"bold"}>
              BÀI VIẾT MỚI NHẤT
            </Typography>
            <Typography variant="h6">-----</Typography>
            {latestPosts.map((latestPost, index) => (
              <Link to={`/thong-bao/${latestPost.slug}`} style={{ textDecoration: "none" }}>
                <Box key={index} display={"flex"} gap={"8px"} alignItems={"center"} minHeight={"56px"}>
                  <Avatar variant="rounded" src={latestPost.image} />
                  <Typography variant="body2" color="#334862">
                    {latestPost.name.length > 100 ? `${latestPost.name.substring(0, 100)}...` : latestPost.name}
                  </Typography>
                </Box>
              </Link>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
