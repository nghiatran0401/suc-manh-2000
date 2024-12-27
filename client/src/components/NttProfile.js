import React from 'react';

const NttProfile = () => {
  const profileStyle = {
    borderRadius: '10px',
    backgroundColor: '#fff',
    padding: '20px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
  };

  const companyLogoStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    marginBottom: '15px',
  };

  const companyNameStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  };

  const badgeStyle = {
    backgroundColor: '#7a4cff',
    color: '#fff',
    fontSize: '12px',
    padding: '5px 10px',
    borderRadius: '15px',
    display: 'inline-block',
    marginBottom: '20px',
  };

  const contactContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: '20px',
  };

  const contactItemStyle = {
    flex: '1 1 45%', // Flexible items, occupying approximately half the width
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: '#555',
  };

  const iconStyle = {
    width: '24px',
    height: '24px',
    marginRight: '10px',
    backgroundColor: '#f0f0f0',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: '#555',
  };

  return (
    <section style={profileStyle}>
      <img
        src="https://via.placeholder.com/80"
        alt="Company Logo"
        style={companyLogoStyle}
      />
      <h1 style={companyNameStyle}>CÔNG TY TNHH LOTTE SHOPPING PLAZA VIỆT NAM</h1>
      <span style={badgeStyle}>Công ty</span>
      <div style={{ textAlign: 'left', marginTop: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
          Thông tin liên hệ
        </h2>
        <div style={contactContainerStyle}>
          <div style={contactItemStyle}>
            <div style={iconStyle}>📧</div>
            <div>
              <strong>Mail</strong>
              <br />
              lotteshoppingplaza.contact@gmail.com
            </div>
          </div>
          <div style={contactItemStyle}>
            <div style={iconStyle}>📍</div>
            <div>
              <strong>Địa chỉ</strong>
              <br />
              Tầng 1 đến Tầng 6, Tòa nhà Lotte Center Hanoi...
            </div>
          </div>
          <div style={contactItemStyle}>
            <div style={iconStyle}>📞</div>
            <div>
              <strong>Số điện thoại</strong>
              <br />
              0935002514
            </div>
          </div>
          <div style={contactItemStyle}>
            <div style={iconStyle}>👤</div>
            <div>
              <strong>Người phụ trách</strong>
              <br />
              Bà Đỗ Lan Anh
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NttProfile;