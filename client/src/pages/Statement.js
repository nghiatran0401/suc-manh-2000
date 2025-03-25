import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, TextField, Typography, Chip, Select, MenuItem, FormControl, Button, Link, Checkbox, ListItemText } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import SearchIcon from "@mui/icons-material/Search";
import VirtualizedTable from "./VirtualizedTable";
import { DESKTOP_WIDTH, SERVER_URL } from "../constants";
import LoadingScreen from "../components/LoadingScreen";
import { sampleData } from "./sample";

const keysMapping = {
  date: "Ngày",
  transaction_code: "Mã giao dịch",
  amount: "Số tiền",
  description: "Nội dung giao dịch",
  project: "Công trình",
  allocated_project: "Link",
  construction_unit: "Ngân hàng",
  month_sheet: "Tháng GD",
};

const USE_SAMPLE_DATA = false;

export default function Statement() {
  const [loading, setLoading] = useState(!USE_SAMPLE_DATA);
  const [data, setData] = useState(USE_SAMPLE_DATA ? sampleData : []);
  const [search, setSearch] = useState("");
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedMonth, setSelectedMonth] = useState([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  useEffect(() => {
    if (!USE_SAMPLE_DATA) {
      (async () => {
        try {
          const response = await axios.get(`${SERVER_URL}/statement`);
          setData(response.data);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, []);

  // Simple date formatter (DD/MM/YYYY)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Filter the data based on search, month, unit, etc.
  const filteredData = data
    .filter((row) => {
      const matchesSearch = Object.values(row).some((cell) => cell?.toString().toLowerCase().includes(search.toLowerCase()));

      // If selectedMonth is an array of "Tháng X" strings, row.month_sheet can be matched if it’s in that set
      const matchesMonth = selectedMonth.length > 0 ? selectedMonth.includes(row.month_sheet) : true;

      // If selectedBank is non‐empty
      const matchesBank = selectedBank ? row.construction_unit === selectedBank : true;

      // If selectedYears is an array of strings, you can parse row’s date if needed
      const rowYear = new Date(row.date).getFullYear().toString();
      const matchesYear = selectedYears.length > 0 ? selectedYears.includes(rowYear) : true;

      return matchesSearch && matchesMonth && matchesBank && matchesYear;
    })
    .map((row) => ({
      ...row,
      date: formatDate(row.date),
      // Format amount with commas
      amount: row.amount ? parseFloat(row.amount).toLocaleString() : "0",
    }));

  // Calculate total amount
  const totalAmount = filteredData.reduce((total, row) => {
    const numeric = parseFloat(row.amount.toString().replace(/[^\d.-]/g, "") || 0);
    return total + (isNaN(numeric) ? 0 : numeric);
  }, 0);

  // Pagination logic
  const pageCount = Math.ceil(filteredData.length / rowsPerPage);
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Box maxWidth={DESKTOP_WIDTH} width={"100%"} m={"0 auto"} my={"24px"} display="flex" flexDirection={"column"} gap={"16px"}>
      <Typography variant="h5" fontWeight={"bold"} textAlign="center">
        SAO KÊ TÀI KHOẢN SỨC MẠNH 2000
      </Typography>

      {/* Announcement + Report */}
      <Box display="flex" justifyContent="space-between" width="100%">
        {/* Announcement Section */}
        <Box p={2} border={1} borderColor="#FFF2F0" borderRadius={3} bgcolor="#FFF2F0" sx={{ flex: 3, margin: 1, padding: 2 }}>
          <Typography variant="h6" gutterBottom color="#F5232D" textAlign="center" sx={{ marginBottom: 2, marginTop: 2 }}>
            THÔNG BÁO
          </Typography>
          <Typography variant="caption" paragraph sx={{ marginBottom: 0.75 }}>
            - Không trích bất kỳ chi phí quản lý nào. 100% số tiền cộng đồng ủng hộ tới tay đối tượng và đúng mục đích.
          </Typography>
          <Typography variant="caption" paragraph sx={{ marginBottom: 0.75 }}>
            - Cập nhật sao kê 1 lần/tuần.
          </Typography>
          <Typography variant="caption" paragraph sx={{ marginBottom: 0.75 }}>
            - Tất cả các chuyển khoản (CK) nhầm vào tài khoản dự án, chúng tôi xin phép đưa vào nội dung xây Trường/Nhà/Cầu.
          </Typography>
          <Typography variant="caption" paragraph sx={{ marginBottom: 0.75 }}>
            - Tìm kiếm theo nội dung CK của bạn.
          </Typography>
          <Typography variant="caption" paragraph sx={{ marginBottom: 0.75 }}>
            - CK sẽ được đưa vào xây dựng công trình (CT) dựa theo nội dung CK của bạn.
            <ul>
              <li>Trong trường hợp CK của bạn được đưa vào xây CT khác với nội dung CK của bạn thì là do CT đó đã đủ tiền, dự án sẽ đưa sang CT khác cũng đang kêu gọi tại cùng thời điểm.</li>
              <li>Đối với các CK không có nội dung cụ thể, dự án sẽ chủ động đưa vào các CT dựa trên mức độ cấp thiết.</li>
            </ul>
          </Typography>
          <Typography variant="caption" sx={{ marginBottom: 2 }}>
            - Liên hệ với dự án khi có vướng mắc về sao kê: Inbox fanpage
            <Link href="https://facebook.com/sucmanh2000" target="_blank" rel="noopener" sx={{ marginLeft: 0.5 }}>
              Sức mạnh 2000
            </Link>
          </Typography>
        </Box>

        {/* Report Section */}
        <Box
          my={2}
          p={2}
          border={1}
          borderColor="#FFF2F0"
          borderRadius={3}
          bgcolor="#FFF2F0"
          sx={{
            flex: 2,
            margin: 1,
            padding: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" textAlign="center">
            BÁO CÁO TỔNG TIỀN
          </Typography>
          <Typography variant="h3" fontWeight="bold" textAlign="center" sx={{ color: "#F5232D" }}>
            {totalAmount.toLocaleString()} VNĐ
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Box display="flex" gap={2} alignItems="center" justifyContent="space-between" width="100%" sx={{ marginTop: "30px", marginBottom: "30px" }}>
        {/* Search */}
        <TextField
          value={search}
          placeholder="Tìm kiếm theo tên, mã GD, công trình"
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          size="medium"
          sx={{
            flex: 2,
            background: "#FFFFFF",
            borderRadius: "12px",
            "& .MuiOutlinedInput-root": {
              height: "40px",
            },
          }}
        />

        {/* Month */}
        <FormControl sx={{ flex: "0.5" }}>
          <Select
            multiple
            displayEmpty
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            renderValue={() => "Tháng"}
            sx={{
              height: "40px",
              background: "#FFFFFF",
              borderRadius: "8px",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "#D9D9D9",
              },
            }}
          >
            {["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"].map((month) => (
              <MenuItem
                key={month}
                value={month}
                disableRipple
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 12px",
                  backgroundColor: selectedMonth.indexOf(month) > -1 ? "#FFF2F1" : "transparent",
                  "&.Mui-selected": {
                    backgroundColor: "#FFF2F1 !important",
                    color: "#F5232D",
                  },
                  "&:hover": { backgroundColor: "#FFF2F1", color: "#F5232D" },
                }}
              >
                <Checkbox
                  checked={selectedMonth.indexOf(month) > -1}
                  sx={{
                    color: selectedMonth.indexOf(month) > -1 ? "#F5232D" : "inherit",
                    "&.Mui-checked": { color: "#F5232D" },
                    transform: "scale(0.8)",
                    padding: 0,
                  }}
                />
                <ListItemText
                  primary={month}
                  sx={{
                    color: selectedMonth.indexOf(month) > -1 ? "#F5232D" : "inherit",
                  }}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Year */}
        <FormControl sx={{ flex: "0.5" }}>
          <Select
            multiple
            displayEmpty
            value={selectedYears}
            onChange={(e) => setSelectedYears(e.target.value)}
            renderValue={() => "Năm"}
            sx={{
              height: "40px",
              background: "#FFFFFF",
              borderRadius: "8px",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "#D9D9D9",
              },
            }}
          >
            {["2025", "2024", "2023", "2022", "2021", "2020"].map((year) => (
              <MenuItem
                key={year}
                value={year}
                disableRipple
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: 2,
                  backgroundColor: selectedYears.indexOf(year) > -1 ? "#FFF2F1" : "transparent",
                  "&.Mui-selected": {
                    backgroundColor: "#FFF2F1 !important",
                    color: "#F5232D",
                  },
                  "&:hover": { backgroundColor: "#FFF2F1", color: "#F5232D" },
                }}
              >
                <Checkbox
                  checked={selectedYears.indexOf(year) > -1}
                  sx={{
                    color: selectedYears.indexOf(year) > -1 ? "#F5232D" : "inherit",
                    "&.Mui-checked": { color: "#F5232D" },
                    transform: "scale(0.8)",
                    padding: 0,
                  }}
                />
                <ListItemText
                  primary={year}
                  sx={{
                    color: selectedYears.indexOf(year) > -1 ? "#F5232D" : "inherit",
                  }}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Bank */}
        <FormControl sx={{ flex: "0.5" }}>
          <Select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            displayEmpty
            sx={{
              height: "40px",
              background: "#FFFFFF",
              borderRadius: "8px",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "#D9D9D9",
              },
            }}
          >
            <MenuItem value="">Ngân hàng</MenuItem>
            <MenuItem value="MB2000">MB2000</MenuItem>
            <MenuItem value="ACB">ACB</MenuItem>
            <MenuItem value="BIDV">BIDV</MenuItem>
            {/* Add more if needed */}
          </Select>
        </FormControl>

        {/* Search Button (optional) */}
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#F5232D",
            color: "#FFFFFF",
            height: "40px",
            borderRadius: "8px",
            "&:hover": { backgroundColor: "#F5232D" },
          }}
        >
          Tìm kiếm
        </Button>
      </Box>

      <Typography>Nhấn vào từng hàng để xem chi tiết giao dịch.</Typography>

      <div>
        {/* Pass the paginated data to the VirtualizedTable */}
        <VirtualizedTable filteredData={paginatedData} keysMapping={keysMapping} />
        {/* Pagination */}
        <Box display="flex" justifyContent="center" marginTop="20px">
          <Pagination count={pageCount} page={page} onChange={handlePageChange} shape="rounded" />
        </Box>
      </div>
    </Box>
  );
}
