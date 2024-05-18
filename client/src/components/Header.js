import * as React from "react";
import { useNavigate } from "react-router-dom";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import MenuItem from "@mui/material/MenuItem";
import { Link } from "react-router-dom";
import { route } from "../routes";

import "./config/styles.css";
import logo from "../assets/logo-header.png";
const pages = ["Giới thiệu", "Tin Tức", "Dự án"];

export default function HeaderBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const navigate = useNavigate();

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <Box className="bar-container">
      <AppBar className="bar" position="static">
        <Container sx={{ maxWidth: "1080px !important", m: "auto", p: "0 !important" }}>
          <Toolbar disableGutters>
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page} onClick={handleCloseNavMenu}>
                    <Typography textAlign="center">{page}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Box display={"flex"} flexGrow={1} gap={"24px"} alignItems={"center"}>
              {route.map((item, index) => {
                if (item.name === "Home") {
                  return <img key={index} src={logo} alt="logo" className="logo" onClick={() => navigate(item.path)} style={{ cursor: "pointer" }} />;
                }

                return (
                  <Typography variant="body1" fontWeight={"bold"} color="#666666D9" noWrap key={index} onClick={() => navigate(item.path)} style={{ cursor: "pointer" }}>
                    {item.name}
                  </Typography>
                );
              })}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}
