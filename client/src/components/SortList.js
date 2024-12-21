import React, { useState } from "react";
import { Box, Button, Menu, MenuItem, Typography, Badge } from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";

const sortOptionsPostMapping = {
  createdAt: "Mới nhất",
  status: "Trạng thái",
  totalFund: "Khoảng tiền",
  random: "Ngẫu nhiên",
};

const sortOptionsNttMapping = {
  name: "Tên",
  type: "Loại",
}

const getSortOptionsMapping = (sortType) => {
  switch (sortType) {
    case 'post':
      return sortOptionsPostMapping;
    case 'ntt':
      return sortOptionsNttMapping;
    default:
      return {};
  }
}

const SortList = (props) => {
  const { searchQuery, sortField, setSortField, sortType = 'post' } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const sortOptionsMapping = getSortOptionsMapping(sortType);

  return (
    <Box>
      <Badge
        badgeContent={sortField !== "createdAt" ? 1 : 0}
        color="error"
        overlap="rectangular"
        sx={{
          "& .MuiBadge-badge": {
            top: 0,
            right: 0,
            transform: "translate(50%, -50%)",
          },
        }}
      >
        <Button
          disabled={searchQuery?.length > 0}
          variant="outlined"
          endIcon={<SortIcon />}
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={{
            color: "#FF5555",
            borderColor: "#FF5555",
            textTransform: "none",
            "&:hover": {
              borderColor: "#FF5555",
              backgroundColor: "rgba(255, 85, 85, 0.1)",
            },
          }}
        >
          Sắp xếp
        </Button>
      </Badge>

      <Menu anchorEl={anchorEl} open={isOpen} onClose={() => setAnchorEl(null)} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} transformOrigin={{ vertical: "top", horizontal: "left" }}>
        {Object.entries(sortOptionsMapping).map(([key, value]) => (
          <MenuItem
            key={key}
            selected={key === sortField}
            onClick={() => {
              setSortField(key);
              setAnchorEl(null);
            }}
          >
            <Typography style={{ fontWeight: key === sortField ? 600 : "normal" }}>{value}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default SortList;
