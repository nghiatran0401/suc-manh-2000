import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, TextField, InputAdornment, Typography, Chip, Select, MenuItem, FormControl, Button, Link, Checkbox, ListItemText } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import SearchIcon from "@mui/icons-material/Search";
import VirtualizedTable from "./VirtualizedTable";
import { DESKTOP_WIDTH, SERVER_URL } from "../constants";

export const keysMapping = {
  date: "Ngày",
  transaction_code: "Mã giao dịch",
  amount: "Số tiền",
  description: "Nội dung giao dịch",
  project: "Công trình",
  allocated_project: "Link",
  construction_unit: "Ngân hàng",
  month_sheet: "Tháng GD",
};

export default function Statement() {
  const [data, setData] = useState([]);
  const [capialSum, setCapitalSum] = useState(0);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [bank, setBank] = useState("");
  const [page, setPage] = useState(1);

  // Pagination
  const rowsPerPage = 10;
  const pageCount = Math.ceil(data.length / rowsPerPage);

  // Calculate total amount based on search/filter
  const totalAmount = data.reduce((total, row) => {
    const numeric = parseFloat(row.amount.toString().replace(/[^\d.-]/g, "") || 0);
    return total + (isNaN(numeric) ? 0 : numeric);
  }, 0);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/statement`, {
          params: {
            search: search,
            month: month,
            year: year,
            bank: bank,
            page: page,
            limit: rowsPerPage,
          },
        });
        setData(response.data.data);
        setCapitalSum(response.data.capitalSum);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, [search, month, year, bank, page]);

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
            {capialSum.toLocaleString()} VNĐ
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Box display="flex" gap={2} alignItems="center" justifyContent="space-between" width="100%" sx={{ marginTop: "30px", marginBottom: "30px" }}>
        <TextField
          value={search}
          placeholder="Tìm kiếm theo tên, mã GD, công trình"
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          size="medium"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="disabled" />
              </InputAdornment>
            ),
          }}
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
        {/* <FormControl sx={{ flex: "0.5" }}>
          <Select
            multiple
            displayEmpty
            value={month}
            onChange={(e) => setmonth(e.target.value)}
            renderValue={() => "Tháng"}
            sx={{
              height: "40px",
              background: "#FFFFFF",
              borderRadius: "4px",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "#D9D9D9",
              },
            }}
          >
            {["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"].map((month, idx) => (
              <MenuItem
                key={idx}
                value={month}
                disableRipple
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 12px",
                  backgroundColor: month.indexOf(month) > -1 ? "#FFF2F1" : "transparent",
                  "&.Mui-selected": {
                    backgroundColor: "#FFF2F1 !important",
                    color: "#F5232D",
                  },
                  "&:hover": { backgroundColor: "#FFF2F1", color: "#F5232D" },
                }}
              >
                <Checkbox
                  checked={month.indexOf(month) > -1}
                  sx={{
                    color: month.indexOf(month) > -1 ? "#F5232D" : "inherit",
                    "&.Mui-checked": { color: "#F5232D" },
                    transform: "scale(0.8)",
                    padding: 0,
                  }}
                />
                <ListItemText primary={month} sx={{ color: month.indexOf(month) > -1 ? "#F5232D" : "inherit" }} />
              </MenuItem>
            ))}
          </Select>
        </FormControl> */}

        <FormControl sx={{ flex: "0.5" }}>
          <Select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            displayEmpty
            sx={{
              height: "40px",
              background: "#FFFFFF",
              borderRadius: "4px",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "#D9D9D9",
              },
            }}
          >
            <MenuItem key={0} value={""}>
              Tháng
            </MenuItem>
            {[...Array(12)].map((_, index) => (
              <MenuItem key={index + 1} value={index + 1}>
                Tháng {index + 1}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Year */}
        <FormControl sx={{ flex: "0.5" }}>
          <Select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            displayEmpty
            sx={{
              height: "40px",
              background: "#FFFFFF",
              borderRadius: "4px",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "#D9D9D9",
              },
            }}
          >
            <MenuItem key={0} value={""}>
              Năm
            </MenuItem>
            {["2025", "2024", "2023"].map((_, index) => (
              <MenuItem key={_} value={_}>
                Năm {_}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Bank */}
        <FormControl sx={{ flex: "0.5" }}>
          <Select
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            displayEmpty
            sx={{
              height: "40px",
              background: "#FFFFFF",
              borderRadius: "4px",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "#D9D9D9",
              },
            }}
          >
            <MenuItem key={0} value={""}>
              Ngân hàng
            </MenuItem>
            {["MB2000", "MB", "VVC"].map((_, index) => (
              <MenuItem key={_} value={_}>
                {_}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Search Button (optional) */}
        {/* <Button
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
        </Button> */}
      </Box>

      <Typography>Nhấn vào từng hàng để xem chi tiết giao dịch.</Typography>
      <VirtualizedTable data={data} />
      <Box display="flex" justifyContent="center">
        <Pagination count={pageCount} page={page} onChange={(event, newPage) => setPage(newPage)} shape="rounded" />
      </Box>
    </Box>
  );
}
