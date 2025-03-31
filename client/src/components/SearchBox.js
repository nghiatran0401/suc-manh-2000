import React from "react";
import { Paper, InputBase, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const SearchBox = (props) => {
  const { searchQuery, setSearchQuery, inputProps } = props;

  return (
    <Paper
      component="form"
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: "40px",
      }}
      onSubmit={(e) => e.preventDefault()}
    >
      <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Tìm kiếm theo tên Dự án" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      <IconButton disabled={true} sx={{ p: "10px" }} aria-label="search">
        <SearchIcon sx={{ color: "red" }} />
      </IconButton>
    </Paper>
  );
};

export default SearchBox;
