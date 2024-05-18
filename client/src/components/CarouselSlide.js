import { Typography, Box } from "@mui/material";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import "./config/styles.css";
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import React from "react";

const members = [
  {
    caption: "Nguyễn Văn A",
    role: "CEO",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.",
    image: "https://th.bing.com/th/id/OIP.ZZf5ANaOGgdbBM-ot_12FgHaHa?w=212&h=212&c=7&r=0&o=5&pid=1.7",
  },
  {
    caption: "Nguyễn Văn B",
    role: "CTO",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.",
    image: "https://i.pinimg.com/originals/a1/aa/07/a1aa076c39909394c9ed871f59969e74.jpg",
  },
  {
    caption: "Nguyễn Văn C",
    role: "CFO",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.",
    image: "https://th.bing.com/th/id/OIP.ZZf5ANaOGgdbBM-ot_12FgHaHa?w=212&h=212&c=7&r=0&o=5&pid=1.7",
  },
  {
    caption: "Nguyễn Văn D",
    role: "CEO",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.",
    image: "https://th.bing.com/th/id/OIP.62UW2I5_9IgQNmE5f305WAHaEK?w=332&h=187&c=7&r=0&o=5&pid=1.7https://i.pinimg.com/originals/a1/aa/07/a1aa076c39909394c9ed871f59969e74.jpg",
  },
  {
    caption: "Nguyễn Văn E",
    role: "CTO",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.",
    image: "https://th.bing.com/th/id/OIP.ZZf5ANaOGgdbBM-ot_12FgHaHa?w=212&h=212&c=7&r=0&o=5&pid=1.7",
  },
  {
    caption: "Nguyễn Văn F",
    role: "CFO",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.",
    image: "https://web.sucmanh2000.com/wp-content/uploads/2024/03/z5237977652393_76a4a6f6cc29cfdddbda533acbb010bf.jpg",
  },
  {
    caption: "Nguyễn Văn G",
    role: "CTO",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.",
    image: "https://th.bing.com/th/id/OIP.ZZf5ANaOGgdbBM-ot_12FgHaHa?w=212&h=212&c=7&r=0&o=5&pid=1.7",
  },
  {
    caption: "Nguyễn Văn H",
    role: "CFO",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.",
    image: "https://web.sucmanh2000.com/wp-content/uploads/2024/03/z5237977652393_76a4a6f6cc29cfdddbda533acbb010bf.jpg",
  },
];

export default function CarouselSlide({ title, items }) {
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 3, // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 2, // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
  };

  return (
    <Box display={"flex"} flexDirection={"column"} gap={"16px"}>
      {title && (
        <Typography variant="h5" fontWeight="bold">
          {title}
        </Typography>
      )}

      <Carousel itemClass="carousel-item-padding" responsive={responsive} autoPlay infinite autoPlaySpeed={5000}>
        {items.map((item, index) => (
          <Card key={index} className="card-contanier" sx={{ m: "16px" }}>
            <CardMedia component="img" alt={item.caption} height="300" image={item.image} />
            <CardContent sx={{ minHeight: "120px" }}>
              {/* <CardActions>
                <div className="card-button">
                  <FacebookOutlinedIcon style={{ color: "red" }} />
                  <EmailOutlinedIcon />
                  <LinkedInIcon />
                  <TwitterIcon />
                </div>
              </CardActions> */}
              {/* <Typography align="center" gutterBottom variant="h5" component="div">
                {item.caption}
              </Typography>
              <Typography align="center" variant="body2" color="text.secondary">
                {item.caption}
              </Typography> */}
              <Typography align="center" variant="body2" color="text.secondary">
                {item.caption}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Carousel>
    </Box>
  );
}
