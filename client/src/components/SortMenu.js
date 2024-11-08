import React, { useState } from 'react';

const SortMenu = () => {
  const [selectedSort, setSelectedSort] = useState('');

  const sortingOptions = ['Mới nhất', 'Tiến độ', 'Khoảng tiền'];

  const handleSortChange = (option) => {
    setSelectedSort(option);
    // You can add additional logic here to handle the sorting logic
  };

  return (
    <div className="sort-menu">
      <button className="sort-menu-button">
        Sắp xếp theo <span>{selectedSort}</span>
      </button>
      <ul className="sort-menu-list">
        {sortingOptions.map((option) => (
          <li
            key={option}
            className={`sort-menu-item ${selectedSort === option ? 'selected' : ''}`}
            onClick={() => handleSortChange(option)}
          >
            {option}
          </li>
        ))}
      </ul>

      {/* Basic styles */}
      <style jsx>{`
        .sort-menu {
          position: relative;
          display: inline-block;
        }
        .sort-menu-button {
          background-color: #f8d7da;
          border: none;
          padding: 10px 20px;
          cursor: pointer;
          border-radius: 5px;
        }
        .sort-menu-list {
          display: none;
          position: absolute;
          background-color: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-radius: 5px;
          list-style: none;
          margin: 0;
          padding: 10px 0;
        }
        .sort-menu:hover .sort-menu-list {
          display: block;
        }
        .sort-menu-item {
          padding: 8px 16px;
          cursor: pointer;
        }
        .sort-menu-item:hover,
        .sort-menu-item.selected {
          background-color: #f1f1f1;
        }
      `}</style>
    </div>
  );
};

export default SortMenu;
