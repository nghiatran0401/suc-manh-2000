import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, AppBar, Box, Toolbar, useMediaQuery, Drawer, List, ListItem, ListItemText, Collapse, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { CDropdown, CDropdownMenu, CDropdownItem } from "@coreui/react";
import "@coreui/coreui/dist/css/coreui.min.css";
import { Menu, ExpandLess, ExpandMore, ArrowDropDown } from "@mui/icons-material";
import "./config/styles.css";
import logo from "../assets/logo-header.png";
import { HEADER_DROPDOWN_LIST } from "../constants";
import axios from "axios";
import { SERVER_URL } from "../constants";
import LoadingScreen from "./LoadingScreen";

export default function HeaderBar() {
  const navigate = useNavigate();
  const [general, setGeneral] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    axios
      .get(SERVER_URL + "/getGeneralData")
      .then((res) => setGeneral(res.data))
      .catch((e) => console.error(e));
  }, []);

  if (Object.keys(general)?.length <= 0) return <LoadingScreen />;
  return (
    <AppBar color="inherit" className="bar" position="fixed" sx={{ top: 0, zIndex: 10000, ...(isMobile && { position: "static" }) }}>
      <Container sx={{ maxWidth: "1080px !important", padding: !isMobile ? "0px !important" : "auto" }}>
        <Toolbar sx={{ padding: "0px !important", margin: "0px !important" }}>
          {isMobile ? (
            <Box display={"flex"} justifyContent={"space-between"} width={"100%"}>
              <img src={logo} alt="logo" style={{ maxWidth: "60px" }} onClick={() => (window.location.href = "/")} />
              <IconButton edge="end" color="inherit" aria-label="menu" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
                <Menu />
              </IconButton>
            </Box>
          ) : (
            <Box display="flex" width={"100%"} gap={"24px"}>
              {HEADER_DROPDOWN_LIST.map((item, index) => (
                <Box key={index} display="flex" sx={{ cursor: "pointer" }}>
                  {item.title === "Home" && <img key={index} src={logo} alt="logo" style={{ maxWidth: "60px" }} onClick={() => (window.location.href = "/")} />}

                  {item.title !== "Home" && (
                    <Box display="flex">
                      {item.children.length > 0 ? (
                        <CDropdown alignment={{ xs: "end", lg: "start" }} className="hover-dropdown">
                          <Typography display="flex" alignItems="center" variant="body1" fontWeight="bold" color="#666666D9" style={{ fontSize: "1rem" }}>
                            {item.title}
                            <ArrowDropDown />
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
                        <Typography display="flex" alignItems="center" variant="body1" fontWeight="bold" color="#666666D9" onClick={() => navigate(item.path)} style={{ fontSize: "1rem" }}>
                          {item.title}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Toolbar>
      </Container>

      <Drawer anchor="right" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <List>
          {HEADER_DROPDOWN_LIST.map((item, index) => (
            <React.Fragment key={index}>
              {item.title !== "Home" && (
                <ListItem
                  onClick={(event) => {
                    event.stopPropagation();
                    if (item.children.length > 0) {
                      setOpenIndex(openIndex === index ? null : index);
                    } else {
                      navigate(item.path);
                      setIsDrawerOpen(false);
                    }
                  }}
                >
                  <ListItemText primary={item.title} />
                  {item.children.length > 0 ? openIndex === index ? <ExpandLess /> : <ExpandMore /> : null}
                </ListItem>
              )}

              {item.children.length > 0 && (
                <Collapse in={openIndex === index} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child, childIndex) => (
                      <ListItem
                        key={childIndex}
                        button
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(child.path);
                          setOpenIndex(null);
                          setIsDrawerOpen(false);
                        }}
                      >
                        <ListItemText primary={child.title + (general?.category[child.path.replace("/", "")] ? ` (${general?.category[child.path.replace("/", "")]})` : "")} />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Drawer>
    </AppBar>
  );
}
