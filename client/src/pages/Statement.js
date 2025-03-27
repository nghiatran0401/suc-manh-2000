import React, { useEffect, useState } from "react";
import axios from "axios";
import { useMediaQuery, Box, TextField, InputAdornment, Typography, Select, MenuItem, FormControl, Button, Link, FormHelperText, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useConfirm } from "material-ui-confirm";
import Pagination from "@mui/material/Pagination";
import SearchIcon from "@mui/icons-material/Search";
import VirtualizedTable from "./VirtualizedTable";
import { DESKTOP_WIDTH, SERVER_URL } from "../constants";

export const keysMapping = {
  date: "Ngày",
  transaction_code: "Mã giao dịch",
  amount: "Số tiền",
  description: "Nội dung giao dịch",
  project_name: "Công trình phân bổ",
  project_url: "Link web công trình",
  bank: "Ngân hàng",
  // month_sheet: "Tháng GD",
};

const SHEETS_TO_CHECK = ["MB2000. 2025 SK Tổng"]; // "MB2002. 2025 SK Tổng", "VVC. 2025 SK Tổng"

export default function Statement() {
  const [data, setData] = useState([]);
  const [capialSum, setCapitalSum] = useState(0);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [bank, setBank] = useState("");
  const [page, setPage] = useState(1);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isAdmin = new URLSearchParams(window.location.search).get("admin") === "true";
  const confirm = useConfirm();
  const [isFetchingButtonClicked, setIsFetchingButtonClicked] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(["MB2000. 2025 SK Tổng"]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [errors, setErrors] = useState({ sheets: false, fromDate: false, toDate: false });
  const [logs, setLogs] = useState([]);

  // Pagination
  const rowsPerPage = 100;
  const pageCount = 10; // Math.ceil(data.length / rowsPerPage);

  // Calculate total amount based on search/filter
  // const totalAmount = data.reduce((total, row) => {
  //   const numeric = parseFloat(row.amount.toString().replace(/[^\d.-]/g, "") || 0);
  //   return total + (isNaN(numeric) ? 0 : numeric);
  // }, 0);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(SERVER_URL + "/statement", {
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

  const handleSyncData = async () => {
    let hasErrors = false;
    let newErrors = { sheets: false, fromDate: false, toDate: false };

    if (selectedOptions.length === 0) {
      newErrors.sheets = true;
      hasErrors = true;
    }
    if (!fromDate) {
      newErrors.fromDate = true;
      hasErrors = true;
    }
    if (!toDate) {
      newErrors.toDate = true;
      hasErrors = true;
    }

    setErrors(newErrors);
    if (hasErrors) return;

    const { confirmed } = await confirm({
      title: "Bạn có chắc muốn tiếp tục không?",
      description: (
        <p>
          Sync data có thể sẽ mất một khoảng thời gian, tùy vào cần update bao nhiêu rows từ Google Sheets sang. Một khi chạy rồi sẽ không dừng được, hãy suy nghĩ kĩ trước khi nhấn nút!!!
          <br />
          <br />
          Sync data {selectedOptions.length} sheet{selectedOptions.length > 1 && "s"} <strong>"{selectedOptions.join(", ")}"</strong> từ ngày <strong>{fromDate}</strong> đến ngày <strong>{toDate}</strong>.
        </p>
      ),
      confirmationButtonProps: { autoFocus: true },
    });

    if (confirmed) {
      setIsFetchingButtonClicked(true);
      const response = await axios.post(SERVER_URL + "/statement/fetchTransactionDataFromGsheet", { selectedOptions, fromDate, toDate });
      setLogs(response.data.logs);
      setIsFetchingButtonClicked(false);
    }
  };

  return (
    <Box maxWidth={DESKTOP_WIDTH} width={"100%"} m={"0 auto"} my={"24px"} display="flex" flexDirection={"column"} gap={"16px"}>
      <Typography variant="h5" fontWeight={"bold"} textAlign="center">
        SAO KÊ TÀI KHOẢN SỨC MẠNH 2000
      </Typography>

      {/* Sync data from Google Sheets */}
      {isAdmin && (
        <Box>
          <Typography variant="h5" fontWeight={"bold"}>
            Sync data from Google Sheets
          </Typography>

          <Dialog open={logs.length > 0} onClose={() => setLogs([])} maxWidth="md" fullWidth>
            <DialogTitle>Results</DialogTitle>
            <DialogContent dividers sx={{ maxHeight: 400, overflowY: "auto" }}>
              {logs.length === 0 ? (
                <Typography>No logs available.</Typography>
              ) : (
                logs.map((log, index) => (
                  <Box
                    key={index}
                    sx={{
                      padding: "8px",
                      backgroundColor: log.error ? "#ffebee" : "#e8f5e9",
                      color: log.error ? "#d32f2f" : "#2e7d32",
                      borderRadius: "4px",
                      marginBottom: "6px",
                    }}
                  >
                    {log.message || log.error}
                  </Box>
                ))
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setLogs([])} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>

          <Typography color="red">*Note: sync toàn bộ data nếu không chọn 2 fields "From Date" và "To Date"</Typography>
          <Box display="flex" gap={2} alignItems="center" my={2}>
            <FormControl sx={{ minWidth: 250, flex: 1 }} error={errors.sheets}>
              <Select multiple value={selectedOptions} onChange={(e) => setSelectedOptions(e.target.value)} renderValue={(selected) => (selected.length ? selected.join(", ") : "Select sheets")} displayEmpty>
                {SHEETS_TO_CHECK.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {errors.sheets && <FormHelperText>Please select at least one sheet</FormHelperText>}
            </FormControl>

            <TextField
              label="From Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              sx={{ minWidth: 180 }}
              error={errors.fromDate}
              helperText={errors.fromDate ? "Please select a from date" : ""}
            />
            <TextField
              label="To Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              sx={{ minWidth: 180 }}
              error={errors.toDate}
              helperText={errors.toDate ? "Please select a to date" : ""}
            />

            <Button variant="contained" onClick={handleSyncData} disabled={isFetchingButtonClicked}>
              {isFetchingButtonClicked ? "Loading..." : "Sync data"}
            </Button>
          </Box>
        </Box>
      )}

      {/* Announcement + Report */}
      <Box display="flex" flexDirection={isMobile ? "column" : "row"} justifyContent="space-between" width="100%">
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
            {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((_) => (
              <MenuItem key={_} value={_}>
                Tháng {_}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
            {["2025", "2024", "2023"].map((_) => (
              <MenuItem key={_} value={_}>
                Năm {_}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
            {["MB2000", "MB", "VVC"].map((_) => (
              <MenuItem key={_} value={_}>
                {_}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Statement table */}
      <Box display="flex" flexDirection="column" gap="8px">
        <Typography variant="body1">Nhấn vào từng hàng để xem chi tiết giao dịch</Typography>
        <VirtualizedTable data={data} />
      </Box>

      {/* Pagination */}
      <Box display="flex" justifyContent="center">
        <Pagination count={pageCount} page={page} onChange={(event, newPage) => setPage(newPage)} shape="rounded" />
      </Box>
    </Box>
  );
}
