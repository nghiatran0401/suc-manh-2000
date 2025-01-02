import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, AppBar, Box, Toolbar, useMediaQuery, Drawer, List, ListItem, ListItemText, Collapse, IconButton, Dialog, Paper, InputBase, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { CDropdown, CDropdownMenu, CDropdownItem } from "@coreui/react";
import "@coreui/coreui/dist/css/coreui.min.css";
import { ExpandLess, ExpandMore, ArrowDropDown, Search } from "@mui/icons-material";
import "./config/styles.css";
import logo from "../assets/logo-header.png";
import { HEADER_DROPDOWN_LIST } from "../constants";
import axios from "axios";
import { SERVER_URL } from "../constants";
import LoadingScreen from "./LoadingScreen";
import DragHandleSharpIcon from "@mui/icons-material/DragHandleSharp";
import SearchIcon from "@mui/icons-material/Search";

export default function HeaderBar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const autocompleteRef = useRef();

  const [general, setGeneral] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const [openSearch, setOpenSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [totalFinishedProjects, setTotalFinishedProjects] = useState(0);

  useEffect(() => {
    Promise.all([axios.get(SERVER_URL + "/getTotalStatisticsCount"), axios.get(SERVER_URL + "/getTotalProjectsCount")])
      .then(([totalStatisticsCount, totalProjectsCount]) => {
        setGeneral(totalStatisticsCount.data);
        setTotalFinishedProjects(totalProjectsCount.data);
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (openSearch) {
      const timer = setTimeout(() => {
        const input = autocompleteRef.current.querySelector("input");
        if (input) input.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [openSearch]);

  const onSearch = (e) => {
    e.preventDefault();
    if (!searchValue) return;

    const q = `/search?q=${searchValue.replace(/\s/g, "+")}`;
    window.location.href = q;

    setOpenSearch(false);
    setSearchValue("");
  };

  if (Object.keys(general)?.length <= 0) return <LoadingScreen />;
  return (
    <AppBar color="inherit" className="bar" position="sticky" sx={{ top: 0, zIndex: 10000 }} height="50px">
      <Container
        sx={{
          maxWidth: "1080px !important",
          padding: !isMobile ? "0px !important" : "auto",
        }}
      >
        <Toolbar sx={{ padding: "0px !important", margin: "0px !important" }}>
          {isMobile ? (
            <Box display={"flex"} justifyContent={"space-between"} width={"100%"}>
              <IconButton edge="start" color="primary" aria-label="menu" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
                <DragHandleSharpIcon sx={{ color: "red" }} />
              </IconButton>
              <img src={logo} alt="logo" style={{ maxWidth: "60px" }} onClick={() => (window.location.href = "/")} />
              <IconButton edge="end" color="primary" aria-label="search" onClick={() => setOpenSearch(!openSearch)}>
                <Search sx={{ color: "red" }} />
              </IconButton>
            </Box>
          ) : (
            <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
              <Box display="flex" alignItems="center">
                <img src={logo} alt="logo" style={{ maxWidth: "60px", cursor: "pointer" }} onClick={() => (window.location.href = "/")} />
              </Box>

              <Box display="flex" gap="24px" flexGrow={1} justifyContent="left">
                {HEADER_DROPDOWN_LIST.map((item, index) => (
                  <Box key={item.title + index} display="flex" alignItems="center" sx={{ cursor: "pointer" }}>
                    {item.title !== "Home" ? (
                      <Box display="flex">
                        {item.children.length > 0 ? (
                          <CDropdown alignment={{ xs: "end", lg: "start" }} className="hover-dropdown">
                            <Typography display="flex" alignItems="center" variant="body1" fontWeight="bold" color="#666666D9" style={{ fontSize: "1rem" }}>
                              {item.title} {item.name === "du-an" && `(${totalFinishedProjects})`}
                              <ArrowDropDown />
                            </Typography>
                            <CDropdownMenu color="secondary">
                              {item.name === "du-an" && (
                                <CDropdownItem href={"/search"}>
                                  <Typography variant="body1">Tất cả Dự án ({totalFinishedProjects})</Typography>
                                </CDropdownItem>
                              )}

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
                    ) : null}
                  </Box>
                ))}
              </Box>

              <IconButton edge="end" color="primary" aria-label="search" onClick={() => setOpenSearch(!openSearch)}>
                <Search sx={{ color: "red" }} />
              </IconButton>
            </Box>
          )}

          <Dialog open={openSearch} onClose={() => setOpenSearch(false)} fullWidth PaperProps={{ style: { position: "absolute", top: 100 } }}>
            <Typography variant="h5" fontWeight="bold" color="red" textAlign="center" mt="16px">
              Tìm kiếm Dự án
            </Typography>

            <Paper
              ref={autocompleteRef}
              component="form"
              sx={{
                p: "2px 4px",
                m: "16px",
                display: "flex",
                alignItems: "center",
                height: "60px",
              }}
              onSubmit={onSearch}
            >
              <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Tìm kiếm theo tên Dự án" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
            </Paper>

            <Button
              variant="outlined"
              endIcon={<SearchIcon />}
              sx={{
                color: "#fff",
                bgcolor: "#FF4747",
                textTransform: "none",
                m: "16px",
                mb: 0,
                "&:hover": { bgcolor: "#FF4747" },
                "&.Mui-disabled": { bgcolor: "#FF7F7F" },
              }}
              onClick={onSearch}
              disabled={!searchValue}
            >
              Tìm kiếm
            </Button>

            <Box display="flex" justifyContent="center">
              <Button
                variant="text"
                sx={{
                  color: "red",
                  width: "fit-content",
                  textTransform: "none",
                  m: "16px",
                  "&:hover": { bgcolor: "#fff" },
                }}
                onClick={() => (window.location.href = "/search")}
              >
                Xem tất cả Dự án
              </Button>
            </Box>
          </Dialog>
        </Toolbar>
      </Container>

      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: {
            "@media (max-width: 600px)": {
              marginTop: "55px",
              height: "calc(100% - 55px)",
            },
          },
        }}
      >
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
                  <ListItemText primary={item.name === "du-an" ? `${item.title} (${totalFinishedProjects})` : item.title} />
                  {item.children.length > 0 ? openIndex === index ? <ExpandLess /> : <ExpandMore /> : null}
                </ListItem>
              )}

              {item.children.length > 0 && (
                <Collapse in={openIndex === index} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.name === "du-an" && (
                      <ListItem
                        onClick={(event) => {
                          event.stopPropagation();
                          window.location.href = "/search";
                          setOpenIndex(null);
                          setIsDrawerOpen(false);
                        }}
                      >
                        <ListItemText primary={<Typography variant="body1">Tất cả Dự án ({totalFinishedProjects})</Typography>} />
                      </ListItem>
                    )}
                    {item.children.map((child, childIndex) => (
                      <ListItem
                        key={childIndex}
                        onClick={(event) => {
                          event.stopPropagation();
                          window.location.href = child.path;
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
