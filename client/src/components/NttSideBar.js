import React from 'react';

const NttSideBar = () => {
  const posts = Array(5).fill({
    title: 'Dự án SOS020 cập nhật tiến độ...',
    date: '23/12/2024',
    image: 'https://via.placeholder.com/80',
  });

  const sidebarPostStyle = {
    display: 'flex',
    marginBottom: '10px',
  };

  const sidebarPostImageStyle = {
    marginRight: '10px',
    width: '50px',
    height: '50px',
  };

  return (
    <aside>
      <h3>Bài viết mới nhất</h3>
      <ul>
        {posts.map((post, index) => (
          <li key={index} style={sidebarPostStyle}>
            <img
              src={post.image}
              alt="Post Thumbnail"
              style={sidebarPostImageStyle}
            />
            <div>
              <p>{post.title}</p>
              <span>{post.date}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  ); 
}

export default NttSideBar;