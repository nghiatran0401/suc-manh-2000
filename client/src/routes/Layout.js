import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import HeaderBar from "../components/Header";
import CarouselMembers from "../components/CarouselMembers";
import Companion from "../components/Companion";
import Footer from "../components/Footer";

export default function Layout() {
  return (
    <Box>
      <HeaderBar />

      <Outlet />

      <CarouselMembers />
      <Companion />
      <Footer />
    </Box>
  );
}
