import React from "react";

const styles = {
  profileContainer: {
    borderRadius: "10px",
    backgroundColor: "#fff",
    padding: "20px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
  },
  companyLogo: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    marginBottom: "15px",
  },
  companyName: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#333",
  },
  badge: {
    backgroundColor: "#7a4cff",
    color: "#fff",
    fontSize: "12px",
    padding: "5px 10px",
    borderRadius: "15px",
    display: "inline-block",
    marginBottom: "20px",
  },
  contactHeader: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "15px",
    textAlign: "left",
  },
  contactContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  contactItem: {
    flex: "1 1 45%",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    color: "#555",
  },
  contactIcon: {
    width: "24px",
    height: "24px",
    marginRight: "10px",
    backgroundColor: "#f0f0f0",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    color: "#555",
  },
};

const ContactItem = ({ icon, title, value }) => (
  <div style={styles.contactItem}>
    <div style={styles.contactIcon}>{icon}</div>
    <div>
      <strong>{title}</strong>
      <br />
      {value}
    </div>
  </div>
);

const NttProfile = () => (
  <section style={styles.profileContainer}>
    <img
      src="https://via.placeholder.com/80"
      alt="Company Logo"
      style={styles.companyLogo}
    />
    <h1 style={styles.companyName}>
      CÔNG TY TNHH LOTTE SHOPPING PLAZA VIỆT NAM
    </h1>
    <span style={styles.badge}>Công ty</span>
    <div style={{ textAlign: "left", marginTop: "20px" }}>
      <h2 style={styles.contactHeader}>Thông tin liên hệ</h2>
      <div style={styles.contactContainer}>
        <ContactItem
          icon="📧"
          title="Mail"
          value="lotteshoppingplaza.contact@gmail.com"
        />
        <ContactItem
          icon="📍"
          title="Địa chỉ"
          value="Tầng 1 đến Tầng 6, Tòa nhà Lotte Center Hanoi..."
        />
        <ContactItem
          icon="📞"
          title="Số điện thoại"
          value="0935002514"
        />
        <ContactItem
          icon="👤"
          title="Người phụ trách"
          value="Bà Đỗ Lan Anh"
        />
      </div>
    </div>
  </section>
);

export default NttProfile;
