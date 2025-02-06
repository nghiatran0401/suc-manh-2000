import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, TextField, Typography, Chip } from "@mui/material";
import { DESKTOP_WIDTH, SERVER_URL } from "../constants";
import VirtualizedTable from "./VirtualizedTable";

const keysMapping = {
  date: "Ngày",
  transaction_code: "Mã giao dịch",
  amount: "Số tiền",
  description: "Nội dung giao dịch",
  project: "Công trình",
  construction_unit: "Quĩ",
  month_sheet: "Tháng GD",
};

export default function Statement() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(SERVER_URL + "/statement");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month === selectedMonth ? "" : month);
  };

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit === selectedUnit ? "" : unit);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const filteredData = data
    .filter((row) => {
      const matchesSearch = Object.values(row).some((cell) => cell?.toString().toLowerCase().includes(search.toLowerCase()));
      const matchesMonth = selectedMonth ? row.month_sheet === selectedMonth : true;
      const matchesUnit = selectedUnit ? row.construction_unit === selectedUnit : true;
      return matchesSearch && matchesMonth && matchesUnit;
    })
    .map((row) => ({
      ...row,
      date: formatDate(row.date),
    }));

  // Calculate total amount
  const totalAmount = filteredData.reduce((total, row) => {
    const amount = row.amount ? parseFloat(row.amount.replace(/\./g, "").replace(/[^0-9.-]+/g, "")) : 0;
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);

  const uniqueMonths = [...new Set(data.map((row) => row.month_sheet))].sort((a, b) => {
    const [monthA, yearA] = a.split(".").map(Number);
    const [monthB, yearB] = b.split(".").map(Number);
    return yearB - yearA || monthB - monthA;
  });

  const uniqueUnits = [...new Set(data.map((row) => row.construction_unit))];

  return (
    <Box maxWidth={DESKTOP_WIDTH} width={"100%"} m={"0 auto"} my={"24px"} display="flex" flexDirection={"column"} gap={"16px"}>
      <Typography variant="h4" fontWeight={"bold"}>
        Thống kê tài khoản Sức mạnh 2000
      </Typography>

      {/* Report Section */}
      <Box my={2}>
        <Typography variant="h6" fontWeight="bold">
          Báo cáo
        </Typography>
        <Typography>
          <strong>Tổng tiền: </strong>
          {totalAmount.toLocaleString()} VNĐ
        </Typography>
      </Box>

      {/* Search section */}
      <Box>
        <Typography fontWeight="bold">Tìm kiếm</Typography>
        <TextField value={search} onChange={handleSearchChange} fullWidth margin="normal" sx={{ margin: 0 }} InputProps={{ sx: { height: "40px" } }} />
      </Box>

      {/* Filtering Section */}
      <Box>
        <Box display="flex" gap={1} flexWrap="wrap" alignItems={"center"}>
          <Typography fontWeight="bold">Năm: </Typography>
          {uniqueMonths.map((month, index) => (
            <Chip key={index} label={month} onClick={() => handleMonthSelect(month)} color={selectedMonth === month ? "primary" : "default"} />
          ))}
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap" mt={1} alignItems={"center"}>
          <Typography fontWeight="bold">Quĩ: </Typography>
          {uniqueUnits.map((unit, index) => (
            <Chip key={index} label={unit} onClick={() => handleUnitSelect(unit)} color={selectedUnit === unit ? "primary" : "default"} />
          ))}
        </Box>
      </Box>
      <VirtualizedTable filteredData={filteredData} keysMapping={keysMapping} />
    </Box>
  );
}
