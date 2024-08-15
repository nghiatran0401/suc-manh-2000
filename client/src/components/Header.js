import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, AppBar, Box, Toolbar, useMediaQuery, Drawer, List, ListItem, ListItemText, Collapse, IconButton, Dialog, Paper, InputBase } from "@mui/material";
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
  const [general, setGeneral] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const [openSearch, setOpenSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [totalProjects, setTotalProjects] = useState(0);
  const autocompleteRef = useRef();

  useEffect(() => {
    axios
      .get(SERVER_URL + "/getClassificationAndCategoryCounts")
      .then((classificationAndCategoryCounts) => {
        setGeneral(classificationAndCategoryCounts.data);

        const total =
          classificationAndCategoryCounts.data.classification["truong-hoc"] +
          classificationAndCategoryCounts.data.classification["khu-noi-tru"] +
          classificationAndCategoryCounts.data.classification["nha-hanh-phuc"] +
          classificationAndCategoryCounts.data.classification["cau-hanh-phuc"] +
          classificationAndCategoryCounts.data.classification["wc"];

        setTotalProjects(total);
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
    if (searchValue) {
      e.preventDefault();
      navigate(`/search?q=${searchValue.replace(/\s/g, "+")}`);
      setOpenSearch(false);
      setSearchValue("");
    }
  };

  if (Object.keys(general)?.length <= 0) return <LoadingScreen />;
  return (
    <AppBar color="inherit" className="bar" position="fixed" sx={{ top: 0, zIndex: 10000, ...(isMobile && { position: "static" }) }}>
      <Container
        sx={{
          maxWidth: "1080px !important",
          padding: !isMobile ? "0px !important" : "auto",
        }}
      >
        <Toolbar sx={{ padding: "0px !important", margin: "0px !important" }}>
          {isMobile ? (
            <Box display={"flex"} justifyContent={"space-between"} width={"100%"}>
              <img src={logo} alt="logo" style={{ maxWidth: "60px" }} onClick={() => (window.location.href = "/")} />
              <Box display={"flex"} gap={"24px"}>
                <IconButton edge="end" color="primary" aria-label="search" onClick={() => setOpenSearch(!openSearch)}>
                  <Search />
                </IconButton>
                <IconButton edge="end" color="primary" aria-label="menu" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
                  <DragHandleSharpIcon />
                </IconButton>
              </Box>
            </Box>
          ) : (
            <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
              {/* Left section (logo) */}
              <Box display="flex" alignItems="center">
                <img src={logo} alt="logo" style={{ maxWidth: "60px", cursor: "pointer" }} onClick={() => (window.location.href = "/")} />
              </Box>

              {/* Center section (menu items) */}
              <Box display="flex" gap="24px" flexGrow={1} justifyContent="left">
                {HEADER_DROPDOWN_LIST.map((item, index) => (
                  <Box key={item.title + index} display="flex" alignItems="center" sx={{ cursor: "pointer" }}>
                    {item.title !== "Home" ? (
                      <Box display="flex">
                        {item.children.length > 0 ? (
                          <CDropdown alignment={{ xs: "end", lg: "start" }} className="hover-dropdown">
                            <Typography display="flex" alignItems="center" variant="body1" fontWeight="bold" color="#666666D9" style={{ fontSize: "1rem" }}>
                              {item.title} {item.name === "du-an" && `(${totalProjects})`}
                              <ArrowDropDown />
                            </Typography>
                            <CDropdownMenu color="secondary">
                              {item.children.map((child, childIndex) => (
                                <CDropdownItem key={`${child.title}-${childIndex}`} href={child.path}>
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

              {/* Right section (search icon) */}
              <IconButton edge="end" color="primary" aria-label="search" onClick={() => setOpenSearch(!openSearch)}>
                <Search />
              </IconButton>
            </Box>
          )}

          <Dialog open={openSearch} onClose={() => setOpenSearch(false)} fullWidth PaperProps={{ style: { position: "absolute", top: 100 } }}>
            <Paper
              ref={autocompleteRef}
              component="form"
              sx={{
                p: "2px 4px",
                m: "0px auto",
                display: "flex",
                alignItems: "center",
                width: "100%",
                height: "60px",
              }}
              onSubmit={onSearch}
            >
              <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search" inputProps={{ "aria-label": "search" }} value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
              <IconButton type="button" sx={{ p: "10px" }} aria-label="search" onClick={onSearch}>
                <SearchIcon />
              </IconButton>
            </Paper>
          </Dialog>
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
                  <ListItemText primary={item.name === "du-an" ? `${item.title} (${totalProjects})` : item.title} />
                  {item.children.length > 0 ? openIndex === index ? <ExpandLess /> : <ExpandMore /> : null}
                </ListItem>
              )}

              {item.children.length > 0 && (
                <Collapse in={openIndex === index} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
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
