import React from "react";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import logo from '../assets/logo-header.png';
import './config/styles.css';
import { Typography } from "@mui/material";
export default function Footer() {
    return (
        <div>
            <Box sx={{ backgroundColor: '#262626', pt: 3 }}>
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
                        <Typography variant="h7" color={'#E4E4E4'}>GIỚI THIỆU</Typography>
                        <div className="content-footer">
                            <Typography>Sứ mệnh</Typography>
                            <Typography>Đội ngũ</Typography>
                            <Typography>Giải thưởng & ấn phẩm</Typography>
                            <Typography>Yêu cầu hình ảnh</Typography>
                        </div>
                    </Grid>
                    <Grid item>
                        <Typography variant="h7" color={'#E4E4E4'}>QUYÊN GÓP </Typography>
                        <div className="content-footer">
                            <Typography>Quét QR Momo</Typography>
                            <Typography>Đăng ký bỏ lợn đất</Typography>
                            <Typography> Góp 2000đ mỗi ngày</Typography>
                            <Typography> Rủ 3 người bạn</Typography>
                        </div>
                    </Grid>
                    <Grid item>
                        <Typography variant="h7" color={'#E4E4E4'}>LIÊN HỆ</Typography>
                        <div className="content-footer">
                            <Typography> P702 - 62 Bà Triệu - TW Đoàn.</Typography>
                            <Typography>Điện thoại: 0975 302 307</Typography>
                            <Typography> Email : niemtingroup@gmail.com</Typography>
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