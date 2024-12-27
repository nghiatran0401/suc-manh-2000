import React from "react";
import NttProfile from "../components/NttProfile";
import SponsoredProjects from "../components/SponsoredProjects";
import NttSideBar from "../components/NttSideBar";

export default function NttDetails() {
  const breadcrumbStyle = {
    padding: '10px',
    backgroundColor: '#f4f4f4',
    fontSize: '14px',
  };

  const contentStyle = {
    display: 'flex',
    gap: '20px',
  };

  const mainContentStyle = {
    flex: 3,
  };

  const sidebarStyle = {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: '10px',
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
    }}>
      <header style={breadcrumbStyle}>
        Trang chủ / Công Ty TNHH LOTTE SHOPPING PLAZA VIỆT NAM
      </header>
      <div style={contentStyle}>
        <div style={mainContentStyle}>
          <NttProfile />
          <SponsoredProjects />
        </div>
        <NttSideBar style={sidebarStyle} />
      </div>
    </div>
  );
}
