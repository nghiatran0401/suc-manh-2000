import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, AppBar, Box, Toolbar, useMediaQuery } from "@mui/material";
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

export default function HeaderBar() {
  const navigate = useNavigate();
  const [general, setGeneral] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
      <AppBar
      className="bar"
      position="fixed"
      sx={{
        top: 0,
        zIndex: 1000,
        ...(isMobile && {
          position: 'static', // Example of a change for mobile, adjust as needed
        }),
      }}
    >
        <Container sx={{ maxWidth: "1080px !important", m: "auto", p: "0 !important" }}>
          <Toolbar sx={{ padding: "0px !important", margin: "0px !important" }}>
            
          {HEADER_DROPDOWN_LIST.map((item, index) => (
        <Box key={index} display="flex" m={isMobile ? "0 8px" : "0 16px"} style={{ cursor: "pointer" }}>
          {item.title === "Home" && (
            <Box display="flex">
              <img key={index} src={logo} alt="logo" className="logo" onClick={() => navigate(item.path)} style={{ maxWidth: isMobile ? '60px' : '120px' }} />
            </Box>
          )}

          {item.title !== "Home" && (
            <Box display="flex" flexDirection={isMobile ? "column" : "row"}>
              {item.children.length > 0 ? (
                <CDropdown alignment={{ xs: 'end', lg: 'start' }} className="hover-dropdown">
                  <Typography display="flex" alignItems="center" variant="body1" fontWeight="bold" color="#666666D9" style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
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
                <Typography display="flex" alignItems="center" variant="body1" fontWeight="bold" color="#666666D9" onClick={() => navigate(item.path)} style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                  {item.title}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      ))}
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}
