import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, AppBar, Box, Toolbar } from "@mui/material";
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

export default function HeaderBar() {
  const navigate = useNavigate();
  const [general, setGeneral] = useState({});

  useEffect(() => {
    axios
      .get(SERVER_URL + "/getGeneralData")
      .then((res) => {
        setGeneral(res.data);
      })
      .catch((e) => console.error(e));
  }, []);

  if (Object.keys(general)?.length <= 0) return <LoadingScreen />;
  return (
    <Box className="bar-container">
      <AppBar className="bar" position="fixed" sx={{ top: 0, zIndex: 1000 }}>
        <Container sx={{ maxWidth: "1080px !important", m: "auto", p: "0 !important" }}>
          <Toolbar sx={{ padding: "0px !important", margin: "0px !important" }}>
            {HEADER_DROPDOWN_LIST.map((item, index) => (
              <Box key={index} display={"flex"} m={"0 16px"} style={{ cursor: "pointer" }}>
                {item.title === "Home" && (
                  <Box display={"flex"}>
                    <img key={index} src={logo} alt="logo" className="logo" onClick={() => navigate(item.path)} />
                  </Box>
                )}

                {item.title !== "Home" && (
                  <Box display={"flex"}>
                    {item.children.length > 0 ? (
                      <CDropdown className="hover-dropdown">
                        <Typography display={"flex"} alignItems={"center"} variant="body1" fontWeight={"bold"} color="#666666D9">
                          {item.title}
                          <ArrowDropDownIcon />
                        </Typography>
                        <CDropdownMenu className="dropdown-menu-position" color="secondary">
                          {item.children.map((child, childIndex) => (
                            <CDropdownItem key={childIndex} href={child.path} style={{ margin: "10px 0" }}>
                              <Typography variant="body1">
                                {child.title}
                                {general?.category[child.path.replace("/", "")] && ` (${general?.category[child.path.replace("/", "")]})`}
                              </Typography>
                            </CDropdownItem>
                          ))}
                        </CDropdownMenu>
                      </CDropdown>
                    ) : (
                      <Typography display={"flex"} alignItems={"center"} variant="body1" fontWeight={"bold"} color="#666666D9" onClick={() => navigate(item.path)}>
                        {item.title}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            ))}

            {/* <SearchBar /> */}
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}
