import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, AppBar, Box, Toolbar, useMediaQuery, Drawer, List, ListItem, ListItemText, Collapse } from "@mui/material";
import { CDropdown, CDropdownMenu, CDropdownItem } from "@coreui/react";
import "@coreui/coreui/dist/css/coreui.min.css";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import "./config/styles.css";
import logo from "../assets/logo-header.png";
import SearchBar from "./SearchBar";
import { HEADER_DROPDOWN_LIST } from "../constants";
import axios from "axios";
import { SERVER_URL } from "../constants";
import LoadingScreen from "./LoadingScreen";
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
export default function HeaderBar() {
  const navigate = useNavigate();
  const [general, setGeneral] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null); // State for menu control
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  const handleClick = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  const open = Boolean(anchorEl);
  useEffect(() => {
    axios
      .get(SERVER_URL + "/getGeneralData")
      .then((res) => {
        setGeneral(res.data);
      })
      .catch((e) => console.error(e));
  }, []);
  const handleMenu = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  if (Object.keys(general)?.length <= 0) return <LoadingScreen />;
  return (
    <AppBar
      color="inherit"
      className="bar"
      position="fixed"
      sx={{
        top: 0,
        zIndex: 1000,
        ...(isMobile && {
          position: 'static',
        }),
      }}
    >
      <Container sx={{ maxWidth: "1080px !important", m: "auto", p: "0 !important" }}>
        <Toolbar sx={{ padding: "0px !important", margin: "0px !important", justifyContent: "space-between" }}>
          {/* Logo or Home link */}
          <Box display="flex" alignItems="center">
            {HEADER_DROPDOWN_LIST.map((item, index) => (
              <Box key={index} display="flex" m={isMobile ? "0 8px" : "0 16px"} style={{ cursor: "pointer" }}>
                {item.title === "Home" && (
                  <Box display="flex">
                    <img key={index} src={logo} alt="logo" className="logo" onClick={() => navigate(item.path)} style={{ maxWidth: isMobile ? '60px' : '60px' }} />
                  </Box>
                )}
                {item.title !== "Home" && !isMobile && (
                  // Render desktop menu items
                  <Box display="flex">
                    {item.children.length > 0 ? (
                      <CDropdown alignment={{ xs: 'end', lg: 'start' }} className="hover-dropdown">
                        <Typography display="flex" alignItems="center" variant="body1" fontWeight="bold" color="#666666D9" style={{ fontSize: '1rem' }}>
                          {item.title}
                          <ArrowDropDownIcon />
                        </Typography>
                        <CDropdownMenu color="secondary">
                          {item.children.map((child, childIndex) => (
                            <CDropdownItem key={childIndex} href={child.path}>
                              <Typography variant="body1">
                                {child.title}
                                {general?.category[child.path.replace("/", "")] && ` (${general?.category[child.path.replace("/", "")]})`}
                              </Typography>
                            </CDropdownItem>
                          ))}
                        </CDropdownMenu>
                      </CDropdown>
                    ) : (
                      <Typography display="flex" alignItems="center" variant="body1" fontWeight="bold" color="#666666D9" onClick={() => navigate(item.path)} style={{ fontSize: '1rem' }}>
                        {item.title}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          {/* Menu Icon for mobile */}
          {isMobile && (
            <Box mr={2}> {/* Adjust the value of mr (margin right) to control how far to the left the button appears */}
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </Container>
      <Drawer
        sx={{ width: 100 }}
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <Box
          // sx={{ width: 200 }}
          role="presentation"
          onClick={() => setIsDrawerOpen(false)}
          onKeyDown={() => setIsDrawerOpen(false)}
        >
          <List>
            {HEADER_DROPDOWN_LIST.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem button onClick={(event) => {
                  event.stopPropagation(); // Stop event propagation
                  handleClick(index);
                }}>
                  <ListItemText primary={item.title} />
                  {item.children.length > 0 ? openIndex === index ? <ExpandLess /> : <ExpandMore /> : null}
                </ListItem>
                {item.children.length > 0 && (
                  <Collapse in={openIndex === index} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.map((child, childIndex) => (
                        <ListItem key={childIndex} button onClick={(event) => {
                          event.stopPropagation(); // Stop event propagation
                          navigate(child.path);
                        }}>
                          <ListItemText primary={child.title + (general?.category[child.path.replace("/", "")] ? ` (${general?.category[child.path.replace("/", "")]})` : '')} />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}