import React from "react";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import logo from '../assets/logo-header.png';
import './config/styles.css';
import { Typography } from "@mui/material";
export default function Footer() {

    const item = [
        {
            name: 'Giới thiệu',
            color: 'red'
        },
        {
            name: 'Tin tức',
            color: 'blue',
        },
    ]
    return (
        <div>
            <Box sx={{ backgroundColor: '#262626', pt: 3, pb: 3 }}>
                <Grid container spacing={2} justifyContent="center" alignItems="center">
                    <Grid item>
                        <div>
                            <img src={logo} style={{ height: 100 }} alt="logo" className='logo' />
                        </div>
                    </Grid>
                    <Grid item>
                        <div style={{ maxWidth: 800 }}>
                            <Typography color={'#E4E4E4'}>
                                Dự án Sức Mạnh 2000 - Dự án gây quỹ của Ánh Sáng Núi Rừng điều hành bởi Hoàng Hoa Trung - Forbes Việt Nam 30Under 30 đồng hành bởi Trung tâm Tình Nguyện Quốc Gia. <br />
                                Phát triển bởi đội ngũ điều hành Dự án Nuôi Em, Ánh Sáng Núi Rừng, nhóm Tình nguyện Niềm Tin.
                            </Typography>
                        </div>
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ backgroundColor: '#262626' }}>
                <Grid container spacing={8} justifyContent="center" >
                    <Grid item>
                        <Typography variant="h6" color={'#E4E4E4'}>GIỚI THIỆU</Typography>
                        <div className="content-footer">
                            <a>Sứ mệnh</a>
                            <a>Đội ngũ</a>
                            <a>Giải thưởng & ấn phẩm</a>
                            <a>Yêu cầu hình ảnh</a>
                        </div>
                    </Grid>
                    <Grid item>
                        <Typography variant="h6" color={'#E4E4E4'}>QUYÊN GÓP </Typography>
                        <div className="content-footer">
                            <a>Quét QR Momo</a>
                            <a>Đăng ký bỏ lợn đất</a>
                            <a> Góp 2000đ mỗi ngày</a>
                            <a> Rủ 3 người bạn</a>
                        </div>
                    </Grid>
                    <Grid item>
                        <Typography variant="h6" color={'#E4E4E4'}>LIÊN HỆ</Typography>
                        <div className="content-footer">
                            <a> P702 - 62 Bà Triệu - TW Đoàn.</a>
                            <a>Điện thoại: 0975 302 307</a>
                            <a> Email : niemtingroup@gmail.com</a>
                        </div>
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ pt: 2, pb: 2, backgroundColor: '#262626', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '0.5px solid white' }}>
                <Typography color={'white'}>
                    Copyright 2024 © Phát triển bởi đội ngũ điều hành Ánh Sáng Núi Rừng và Dự án Nuôi Em.
                </Typography>
            </Box>
        </div>


    )
}