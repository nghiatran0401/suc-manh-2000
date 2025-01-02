import React from "react";
import NttProfile from "../components/NttProfile";
import SponsoredProjects from "../components/SponsoredProjects";
import NttSideBar from "../components/NttSideBar";

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
  },
  breadcrumb: {
    padding: "10px",
    backgroundColor: "#f4f4f4",
    fontSize: "14px",
  },
  content: {
    display: "flex",
    gap: "20px",
  },
  mainContent: {
    flex: 3,
  },
  sidebar: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: "10px",
  },
};

export default function NttDetails() {
  return (
    <div style={styles.container}>
      <header style={styles.breadcrumb}>
        Trang chủ / Công Ty TNHH LOTTE SHOPPING PLAZA VIỆT NAM
      </header>
      <div style={styles.content}>
        <div style={styles.mainContent}>
          <NttProfile />
          <SponsoredProjects />
        </div>
        <aside style={styles.sidebar}>
          <NttSideBar />
        </aside>
      </div>
    </div>
  );
}
