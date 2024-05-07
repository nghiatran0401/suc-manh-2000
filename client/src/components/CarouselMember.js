import { Typography, Box } from "@mui/material";
import Carousel from "react-multi-carousel";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import "react-multi-carousel/lib/styles.css";
import "./config/styles.css"
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import React from "react";

export default function CarouselMember() {
    const members = [
        {
            name: 'Nguyễn Văn A',
            role: 'CEO',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.',
            avatar: 'https://th.bing.com/th/id/OIP.ZZf5ANaOGgdbBM-ot_12FgHaHa?w=212&h=212&c=7&r=0&o=5&pid=1.7'
        },
        {
            name: 'Nguyễn Văn B',
            role: 'CTO',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.',
            avatar: 'https://i.pinimg.com/originals/a1/aa/07/a1aa076c39909394c9ed871f59969e74.jpg'
        },
        {
            name: 'Nguyễn Văn C',
            role: 'CFO',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.',
            avatar: 'https://th.bing.com/th/id/OIP.ZZf5ANaOGgdbBM-ot_12FgHaHa?w=212&h=212&c=7&r=0&o=5&pid=1.7'
        },
        {
            name: 'Nguyễn Văn D',
            role: 'CEO',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.',
            avatar: 'https://th.bing.com/th/id/OIP.62UW2I5_9IgQNmE5f305WAHaEK?w=332&h=187&c=7&r=0&o=5&pid=1.7https://i.pinimg.com/originals/a1/aa/07/a1aa076c39909394c9ed871f59969e74.jpg'
        },
        {
            name: 'Nguyễn Văn E',
            role: 'CTO',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.',
            avatar: 'https://th.bing.com/th/id/OIP.ZZf5ANaOGgdbBM-ot_12FgHaHa?w=212&h=212&c=7&r=0&o=5&pid=1.7'
        },
        {
            name: 'Nguyễn Văn F',
            role: 'CFO',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.',
            avatar: 'https://web.sucmanh2000.com/wp-content/uploads/2024/03/z5237977652393_76a4a6f6cc29cfdddbda533acbb010bf.jpg'
        },
        {
            name: 'Nguyễn Văn G',
            role: 'CTO',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.',
            avatar: 'https://th.bing.com/th/id/OIP.ZZf5ANaOGgdbBM-ot_12FgHaHa?w=212&h=212&c=7&r=0&o=5&pid=1.7'
        },
        {
            name: 'Nguyễn Văn H',
            role: 'CFO',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.',
            avatar: 'https://web.sucmanh2000.com/wp-content/uploads/2024/03/z5237977652393_76a4a6f6cc29cfdddbda533acbb010bf.jpg'
        },
    ];
    const responsive = {
        superLargeDesktop: {
            // the naming can be any, depends on you.
            breakpoint: { max: 4000, min: 1024 },
            items: 4,
            slidesToSlide: 4,
        },
        desktop: {
            breakpoint: { max: 1024, min: 800 },
            items: 3,
            slidesToSlide: 2,
        },
        tablet: {
            breakpoint: { max: 800, min: 464 },
            items: 2,
            slidesToSlide: 1,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
            slidesToSlide: 1,
        }
    };
    return (
        <Box display = { "flex"} flexDirection = { "column"} gap = { "16px"} p = { "40px"}>
            <Typography variant="h5" fontWeight="bold">
                Đội ngũ vận hành SỨC MẠNH 2000
            </Typography>
            <Carousel
                itemClass="carousel-item-padding"
                responsive={responsive}
                autoPlay={true}
                infinite={true}
                autoPlaySpeed={5000}
            >
                {members.map((member, index) => (
                    <div>
                        <Card sx={{ maxWidth: 345 }} className="card-contanier">

                            <CardMedia
                                component="img"
                                alt={member.name}
                                height="300"
                                image={member.avatar}
                                
                            />
                            <CardContent>
                                <CardActions>
                                    <div className="card-button">
                                        <FacebookOutlinedIcon style={{color: 'red'}} />
                                        <EmailOutlinedIcon />
                                        <LinkedInIcon />
                                        <TwitterIcon />
                                    </div>
                                </CardActions>
                                <Typography align="center" gutterBottom variant="h5" component="div">
                                    {member.name}
                                </Typography>
                                <Typography align="center" variant="body2" color="text.secondary">
                                    {member.role}
                                </Typography>
                                <Typography align="center" variant="body2" color="text.secondary">
                                    {member.content}
                                </Typography>
                            </CardContent>
                            
                        </Card>
                    </div>
                ))}
            </Carousel>
        </Box>
    );
}