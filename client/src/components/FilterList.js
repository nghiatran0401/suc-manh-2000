import React, { useState, useRef, useEffect } from "react";
import { Box, Button, Stack, Typography, Badge } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import { categoryMapping, classificationMapping, totalFundMapping, statusMapping } from "../constants";
import { convertToCleanedName } from "../helpers";
import { provincesAndCitiesObj } from "../vietnam-provinces";
import Select from "react-select";

const FilterComponent = (props) => {
  const { label, onChange, options, value } = props;

  return (
    <Stack display={"flex"} direction={"column"} spacing={0.5}>
      <Typography color={"rgba(0, 0, 0, 0.5)"} variant="subtitle2" fontWeight={"bold"}>
        {label}
      </Typography>

      <Select
        placeholder={"Tất cả"}
        value={value}
        onChange={onChange}
        options={[{ label: "Tất cả", value: "all" }, ...options]}
        styles={{
          container: (provided) => ({ ...provided, width: "100%" }),
          control: (provided, state) => ({
            ...provided,
            color: state.isFocused ? "#FF5555" : provided.borderColor,
            borderColor: state.isFocused ? "rgba(0, 0, 0, 0.5)" : provided.borderColor,
            "&:hover": {
              borderColor: "rgba(0, 0, 0, 0.5)",
            },
            boxShadow: state.isFocused ? "0 0 0 1px rgba(0, 0, 0, 0.5)" : provided.boxShadow,
          }),
          singleValue: (provided, state) => ({
            ...provided,
            fontWeight: 500,
          }),
        }}
      />
    </Stack>
  );
};

const filterOptionsMapping = {
  category: "Năm",
  classification: "Phân loại công trình",
  totalFund: "Khoảng tiền",
  status: "Tiến độ",
  province: "Tỉnh",
};

const FilterList = (props) => {
  const { searchQuery, filters, setFilters, provinceCount } = props;
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickOutside = (event) => {
    if (filterRef.current && !filterRef.current.contains(event.target)) {
      setShowFilters(false);
    }
  };

  const getActiveValue = (type, typeValue) => {
    switch (type) {
      case "category":
        return typeValue === "all" ? null : { label: categoryMapping[typeValue], value: typeValue };
      case "classification":
        return typeValue === "all" ? null : { label: classificationMapping[typeValue], value: typeValue };
      case "totalFund":
        return typeValue === "all" ? null : { label: totalFundMapping[typeValue], value: typeValue };
      case "status":
        return typeValue === "all" ? null : { label: statusMapping[typeValue], value: typeValue };
      case "province":
        return typeValue === "all" ? null : { label: provincesAndCitiesObj[typeValue], value: typeValue };
      default:
        return null;
    }
  };

  const getOptionValues = (type, typeValue) => {
    switch (type) {
      case "category":
        return Object.entries(categoryMapping)
          .filter(([v, l]) => v.includes("du-an"))
          .map(([value, label]) => ({ value, label }));
      case "classification":
        return Object.entries(classificationMapping).map(([value, label]) => ({ value, label }));
      case "totalFund":
        return Object.entries(totalFundMapping).map(([value, label]) => ({ value, label }));
      case "status":
        return Object.entries(statusMapping).map(([value, label]) => ({ value, label }));
      case "province":
        return Object.entries(provinceCount)
          .sort(([, countA], [, countB]) => countB - countA)
          .map(([p, count]) => ({ label: `${provincesAndCitiesObj[p]} (${count})`, value: convertToCleanedName(p) }));
      default:
        return [];
    }
  };

  return (
    <Box ref={filterRef} sx={{ position: "relative" }}>
      <Badge
        badgeContent={Object.values(filters).filter((v) => v !== "all").length}
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
          endIcon={<TuneIcon />}
          sx={{
            color: "#FF5555",
            borderColor: "#FF5555",
            textTransform: "none",
            "&:hover": {
              borderColor: "#FF5555",
              backgroundColor: "rgba(255, 85, 85, 0.1)",
            },
          }}
          onClick={() => setShowFilters((prev) => !prev)}
        >
          Bộ lọc
        </Button>
      </Badge>

      {showFilters && (
        <Box
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "250px",
            p: 2,
            border: "1px solid #ddd",
            borderRadius: 1,
            backgroundColor: "white",
            zIndex: 1,
          }}
        >
          {Object.entries(filters).map(([key, value]) => {
            if (!window.location.pathname.includes("search") && key === "category") return;
            return (
              <FilterComponent
                key={key}
                label={filterOptionsMapping[key]}
                value={getActiveValue(key, value)}
                onChange={(option) => setFilters({ ...filters, [key]: option.value })}
                options={getOptionValues(key, value)}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default FilterList;
