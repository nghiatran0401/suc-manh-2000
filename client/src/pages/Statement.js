import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, TextField, Typography, Chip, Select, MenuItem, FormControl, Button, Link, Checkbox, ListItemText, InputAdornment } from "@mui/material";
import VirtualizedTable from "./VirtualizedTable";
import LoadingScreen from "../components/LoadingScreen";
import { useConfirm } from "material-ui-confirm";
import { sampleData } from "./sample";
import "./Statement.css";
import Pagination from "@mui/material/Pagination";
import SearchIcon from "@mui/icons-material/Search";

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
const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const SHEETS_TO_CHECK = ["MB2000. 2025 SK Tổng"]; // "MB2002. 2025 SK Tổng", "VVC. 2025 SK Tổng"

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// This is for Khue to dev FE
const USE_SAMPLE_DATA = true;

export default function Statement() {
  const isAdmin = new URLSearchParams(window.location.search).get("admin") === "true";
  const confirm = useConfirm();

  const [loading, setLoading] = useState(USE_SAMPLE_DATA ? false : true);
  const [data, setData] = useState(USE_SAMPLE_DATA ? sampleData : []);
  const [search, setSearch] = useState("");
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedBank, setSelectedBank] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [isFetchingButtonClicked, setIsFetchingButtonClicked] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState("2025-01-01");
  const [normalLogs, setNormalLogs] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);

  useEffect(() => {
    if (USE_SAMPLE_DATA) return;

    const eventSource = new EventSource(SERVER_URL + "/api/logs");
    eventSource.onmessage = (event) => {
      setIsFetchingButtonClicked(true);
      const message = JSON.parse(event.data).message;
      if (message.toLowerCase().includes("incorrect") || message.toLowerCase().includes("error")) {
        setErrorLogs((prevLogs) => [...prevLogs, message]);
      } else {
        setNormalLogs((prevLogs) => [...prevLogs, message]);
      }
    };
    return () => eventSource.close();
  }, []);

  useEffect(() => {
    if (USE_SAMPLE_DATA) return;

    async function fetchData() {
      // TODO: Cache to browser localstorage
      // const cachedData = localStorage.getItem("statements");
      // if (cachedData) {
      //   setData(JSON.parse(cachedData));
      //   setLoading(false);
      // }

      try {
        const response = await axios.get(`${SERVER_URL}/api/getData`);
        setData(response.data);
        // localStorage.setItem("statements", JSON.stringify(response.data));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  const handleSyncData = async () => {
    const { confirmed } = await confirm({
      title: "Bạn có chắc muốn tiếp tục không?",
      description: (
        <p>
          Sync data có thể sẽ mất một khoảng thời gian, tùy vào cần update bao nhiêu rows từ Google Sheets sang. Một khi chạy rồi sẽ không dừng được, hãy suy nghĩ kĩ trước khi nhấn nút!!!
          <br />
          <br />
          Sync data {selectedOptions.length} sheet{selectedOptions.length > 1 && "s"} <strong>"{selectedOptions.join(", ")}"</strong> từ ngày <strong>{formatDate(fromDate)}</strong> đến ngày{" "}
          <strong>{formatDate(toDate)}</strong>.
        </p>
      ),
      confirmationButtonProps: { autoFocus: true },
    });

    if (confirmed) {
      setIsFetchingButtonClicked(true);
      await axios.post(SERVER_URL + "/api/fetchData", { selectedOptions, fromDate, toDate });
      setIsFetchingButtonClicked(false);
      window.alert("Done!");
    }
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
      amount: row.amount ? parseFloat(row.amount).toLocaleString() : 0,
    }));

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

  const [page, setPage] = useState(1);
  const rowsPerPage = 14;

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // const handleChange = (event) => {
  //   setSelectedMonth(event.target.value);
  // };

  if (loading) return <LoadingScreen />;
  return (
    <Box maxWidth={"1200px"} width={"100%"} m={"0 auto"} my={"24px"} display="flex" flexDirection={"column"} gap={"16px"}>
      <Typography variant="h5" fontWeight={"bold"} className="sta-title">
        SAO KÊ TÀI KHOẢN SỨC MẠNH 2000
      </Typography>

      {/* Live logs */}
      {isAdmin && (
        <div>
          <h2>Live Logs</h2>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1, height: "300px", overflowY: "scroll", background: "#222", color: "#fff", padding: "10px", marginBottom: "16px" }}>
              <h3>Normal Logs</h3>
              {normalLogs.map((log, index) => (
                <div key={index} style={{ color: "inherit" }}>
                  {log}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, height: "300px", overflowY: "scroll", background: "#222", color: "#fff", padding: "10px", marginBottom: "16px" }}>
              <h3>Error Logs</h3>
              {errorLogs.map((log, index) => (
                <div key={index} style={{ color: "red" }}>
                  {log}
                </div>
              ))}
            </div>
          </div>

          <Typography color="red">*Note: Option sync toàn bộ data nếu không chọn 2 fields "From Date" và "To Date"</Typography>
          <Box display="flex" gap={2} alignItems="center" my={2}>
            <FormControl sx={{ width: "600px" }}>
              <Select multiple value={selectedOptions} onChange={(e) => setSelectedOptions(e.target.value)} renderValue={(selected) => (selected.length === 0 ? "Select sheets" : selected.join(", "))} displayEmpty>
                {SHEETS_TO_CHECK.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="From Date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <TextField label="To Date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            <Button variant="contained" onClick={handleSyncData} disabled={isFetchingButtonClicked}>
              {isFetchingButtonClicked ? "Loading..." : "Sync data"}
            </Button>
          </Box>
        </div>
      )}

      <Box display="flex" justifyContent="space-between" width="100%">
        {/* Announcement Section */}
        <Box p={2} border={1} borderColor="#FFF2F0" borderRadius={3} bgcolor="#FFF2F0" sx={{ flex: 3, margin: 1, padding: 2 }}>
          <Typography variant="h6" gutterBottom color="#F5232D" className="sta-title" sx={{ display: "block", marginBottom: 2, marginTop: 2 }}>
            THÔNG BÁO
          </Typography>
          <Typography variant="caption" sx={{ display: "block", marginBottom: 0.75, marginLeft: 2, marginRight: 2 }} paragraph>
            - Không trích bất kỳ chi phí quản lý nào. 100% số tiền cộng đồng ủng hộ tới tay đối tượng và đúng mục đích.
          </Typography>
          <Typography variant="caption" sx={{ display: "block", marginBottom: 0.75, marginLeft: 2, marginRight: 2 }} paragraph>
            - Cập nhật sao kê 1 lần/tuần.
          </Typography>
          <Typography variant="caption" sx={{ display: "block", marginBottom: 0.75, marginLeft: 2, marginRight: 2 }} paragraph>
            - Tất cả các chuyển khoản (CK) nhầm vào tài khoản dự án, chúng tôi xin phép đưa vào nội dung xây Trường/Nhà/Cầu.
          </Typography>
          <Typography variant="caption" sx={{ display: "block", marginBottom: 0.75, marginLeft: 2, marginRight: 2 }} paragraph>
            - Tìm kiếm theo nội dung CK của bạn.
          </Typography>
          <Typography variant="caption" sx={{ display: "block", marginBottom: 0.75, marginLeft: 2, marginRight: 2 }} paragraph>
            - CK sẽ được đưa vào xây dựng công trình (CT) dựa theo nội dung CK của bạn.
            <ul>
              <li>Trong trường hợp CK của bạn được đưa vào xây CT khác với nội dung CK của bạn thì là do CT đó đã đủ tiền, dự án sẽ đưa sang CT khác cũng đang kêu gọi tại cùng thời điểm.</li>
              <li>Đối với các CK không có nội dung cụ thể, dự án sẽ chủ động đưa vào các CT dựa trên mức độ cấp thiết.</li>
            </ul>
          </Typography>
          <Typography variant="caption" sx={{ display: "block", marginBottom: 2, marginLeft: 2, marginRight: 2 }}>
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
          sx={{ flex: 2, margin: 1, padding: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
        >
          <Typography variant="h6" className="sta-title">
            BÁO CÁO TỔNG TIỀN
          </Typography>
          <Typography variant="h3" fontWeight="bold" className="sta-title" sx={{ color: "#F5232D" }}>
            {/* <strong>Tổng tiền: </strong> */}
            {totalAmount.toLocaleString()} VNĐ
          </Typography>
        </Box>
      </Box>

      <Box display="flex" gap={2} alignItems="center">
        {/* <Typography fontWeight="bold">Tìm kiếm</Typography> */}
        <TextField
          value={search}
          placeholder="Tìm kiếm theo tên, mã GD, công trình"
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          size="medium"
          className="flex-1"
          sx={{
            flex: 2,
            background: "#FFFFFF",
            border: "  #D9D9D9",
            borderRadius: "12px",
            "& .MuiOutlinedInput-root": {
              height: "40px",
            },
          }}
        />

        {/* Filtering Section */}
        {/* Month */}
        <FormControl sx={{ flex: "0.5" }}>
          <Select
            multiple
            displayEmpty
            value={Array.isArray(selectedMonth) ? selectedMonth : []}
            onChange={(e) => setSelectedMonth(e.target.value)}
            renderValue={() => "Tháng"}
            sx={{
              height: "40px",
              background: "#FFFFFF",
              border: " #D9D9D9",
              borderRadius: "8px",
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#D9D9D9",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#D9D9D9",
              },
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
                <ListItemText primary={month} sx={{ color: selectedMonth.indexOf(month) > -1 ? "#F5232D" : "inherit" }} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Year */}
        <FormControl sx={{ flex: "0.5" }}>
          {/* <Typography fontWeight="bold">Năm:</Typography> */}
          <Select
            multiple
            displayEmpty
            value={selectedYears}
            onChange={(e) => setSelectedYears(e.target.value)}
            renderValue={() => "Năm"}
            variant="outlined"
            size="small"
            className="w-24"
            sx={{
              height: "40px",
              background: "#FFFFFF",
              border: " #D9D9D9",
              borderRadius: "8px",
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#D9D9D9",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#D9D9D9",
              },
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
                    color: selectedYears.indexOf(year) > -1 ? "red" : "inherit",
                    "&.Mui-checked": { color: "#F5232D", backgroundColor: "#FFF2F1" },
                    "&:hover": { color: "#F5232D", backgroundColor: "#FFF2F1" },
                    transform: "scale(0.8)",
                    padding: 0,
                  }}
                />
                <ListItemText primary={year} sx={{ color: selectedYears.indexOf(year) > -1 ? "red" : "inherit" }} />
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
              border: " #D9D9D9",
              borderRadius: "8px",
            }}
          >
            <MenuItem value="">Ngân hàng</MenuItem>
            {/* {['Vietcombank', 'Techcombank', 'BIDV', 'ACB'].map((bank) => (
              <MenuItem key={bank} value={bank}>{bank}</MenuItem>
            ))} */}
          </Select>
        </FormControl>

        {/* Search Button */}
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
        <VirtualizedTable filteredData={paginatedData} keysMapping={keysMapping} />
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <Pagination count={Math.ceil(filteredData.length / rowsPerPage)} page={page} onChange={handlePageChange} shape="rounded" />
        </div>
      </div>
    </Box>
  );
}
