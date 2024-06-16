import { Box, Typography, Grid, CardContent, Card as MuiCard, Button } from "@mui/material";
import { styled } from "@mui/system";
import { Link, useParams } from "react-router-dom";
import { truncate } from "../helpers";

const Card = styled(MuiCard)({
  minHeight: "500px",
  cursor: "pointer",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
  },
});

export default function CardList(props) {
  const { category } = useParams();
  return (
    <Box maxWidth={"1080px"} m={"auto"} display={"flex"} flexDirection={"column"} gap={"32px"}>
      {props.title && (
        <Typography variant="h5" fontWeight="bold" color={"#000"} textAlign={"center"}>
          {props.title}
        </Typography>
      )}

      <Grid container spacing={3}>
        {props.posts?.map((post, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Link to={`${props.category ? props.category : `/${category}`}/${post.slug}`} style={{ textDecoration: "none" }}>
              <Card style={{ overflow: "visible", minHeight: "fit-content", minHeight: props.showDescription ? "500px" : "400px" }}>
                <div style={{ position: "relative", display: "flex", flexDirection: "row" }}>
                  <img style={{ width: "100%", height: "225px", objectFit: "cover" }} alt={post.name} src={post.thumbnail ?? "https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png"} />
                </div>
                <CardContent>
                  <Typography variant="body1" fontWeight={"bold"}>
                    {post.name}
                  </Typography>

                  {props.showDescription && post.description && (
                    <>
                      <div
                        style={{
                          backgroundColor: "rgba(0, 0, 0, .1)",
                          display: "block",
                          height: "2px",
                          margin: "0.5em 0",
                          maxWidth: "30px",
                          width: "100%",
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" dangerouslySetInnerHTML={{ __html: truncate(post.description.replace(/h1/g, "div"), 100) }} />
                    </>
                  )}

                  <Typography variant="body2" mt={"16px"}>
                    {new Date(post.publish_date).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
