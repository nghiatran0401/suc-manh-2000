import React from 'react';

const SponsoredProjects = () => {
  const projects = Array(5).fill({
    title: "DAD018 - Điểm trường Huổi Ún...",
    location: "Mường Pồn, Mường Chà, Điện Biên",
    date: "1 tháng trước",
    amount: "40.000.000 VNĐ",
    image: "https://via.placeholder.com/300",
  });

  const projectListStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  };

  const projectCardStyle = {
    border: '1px solid #ccc',
    padding: '10px',
    display: 'flex',
    gap: '10px',
  };

  return (
    <section>
      <h2>Các dự án đã tài trợ</h2>
      <div style={projectListStyle}>
        {projects.map((project, index) => (
          <div key={index} style={projectCardStyle}>
            <img src={project.image} alt="Project" />
            <div className="project-info">
              <h3>{project.title}</h3>
              <p>{project.location}</p>
              <p>{project.date}</p>
              <p><strong>{project.amount}</strong></p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SponsoredProjects;
