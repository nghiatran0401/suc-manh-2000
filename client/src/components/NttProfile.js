import React from 'react';

const NttProfile = () => {
  const profileStyle = {
    border: '1px solid #ccc',
    padding: '15px',
    marginBottom: '20px',
  };

  const profileHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
  };

  const companyLogoStyle = {
    borderRadius: '50%',
    marginRight: '10px',
  };

  const badgeStyle = {
    backgroundColor: 'green',
    color: 'white',
    padding: '3px 6px',
    fontSize: '12px',
    borderRadius: '4px',
  };

  return (
    <section style={profileStyle}>
      <div style={profileHeaderStyle}>
        <img
          src="https://via.placeholder.com/80"
          alt="Company Logo"
          style={companyLogoStyle}
        />
        <div>
          <h1 style={{ fontSize: '18px' }}>CÔNG TY TNHH LOTTE SHOPPING PLAZA VIỆT NAM</h1>
          <span style={badgeStyle}>Verified</span>
        </div>
      </div>
      <div>
        <p>
          Email:{' '}
          <a href="mailto:sample@example.com">sample@example.com</a>
        </p>
        <p>
          Phone: <a href="tel:+840123456789">+84 0123 456 789</a>
        </p>
        <p>Address: Tầng 12, Lotte Center Hanoi...</p>
      </div>
    </section>
  );
};

export default NttProfile;