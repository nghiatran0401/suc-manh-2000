import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  useMediaQuery,
  Box,
  TextField,
  InputAdornment,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Button,
  Link,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  InputLabel,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useConfirm } from "material-ui-confirm";
import Pagination from "@mui/material/Pagination";
import SearchIcon from "@mui/icons-material/Search";
import { DESKTOP_WIDTH, SERVER_URL } from "../constants";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const SHEETS_TO_CHECK = ["MB2000. 2025 SK Tổng"]; // "MB2002. 2025 SK Tổng", "VVC. 2025 SK Tổng"

export default function Statement() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [capialSum, setCapitalSum] = useState(0);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [bank, setBank] = useState("");
  const [page, setPage] = useState(1);
  const [summaryData, setSummaryData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("2025");

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

  const rowsPerPage = 20;
  const pageCount = data.length < rowsPerPage ? Math.ceil(data.length / rowsPerPage) : rowsPerPage;

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(SERVER_URL + "/tra-cuu-sao-ke", {
          params: {
            search: search,
            month: month,
            year: year,
            bank: bank,
            page: page,
            limit: rowsPerPage,
          },
        });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, [search, month, year, bank, page]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(SERVER_URL + "/tra-cuu-sao-ke/summary", {
          params: {
            year: selectedYear,
          },
        });
        setSummaryData(transformSummaryData(res.data.summary));
        setCapitalSum(res.data.total);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, [selectedYear]);

  const transformSummaryData = (raw) => {
    const map = {};
    raw.forEach(({ month, bank, capital_sum }) => {
      if (!map[month]) {
        map[month] = { month: parseInt(month, 10) };
      }
      map[month][bank] = Number(capital_sum) || 0;
    });
    return Object.values(map).sort((a, b) => a.month - b.month);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1 }}>
          <Typography>Tháng: {label}</Typography>
          {payload.map((item, i) => (
            <Typography key={i}>
              {item.name}: {Number(item.value).toLocaleString()} VNĐ
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

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
      const response = await axios.post(SERVER_URL + "/tra-cuu-sao-ke/fetchTransactionDataFromGsheet", { selectedOptions, fromDate, toDate });
      setLogs(response.data.logs);
      setIsFetchingButtonClicked(false);
    }
  };

  return (
    <Box maxWidth={DESKTOP_WIDTH} width={"100%"} m={"0 auto"} my={"24px"} display="flex" flexDirection={"column"} gap={"16px"} p={2}>
      <Typography variant="h5" fontWeight={"bold"} textAlign="center">
        SAO KÊ TÀI KHOẢN SỨC MẠNH 2000
      </Typography>

      {loading && (
        <Box minHeight={"500px"} mt={"200px"}>
          <LinearProgress />
        </Box>
      )}

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

      {/* Chart */}
      {isAdmin && (
        <Box>
          <Typography variant="h6" gutterBottom fontWeight="bold" mb={2}>
            📊 Thống kê theo tháng
          </Typography>

          <Box display="flex" gap={2} mb={3}>
            <FormControl>
              <InputLabel>Năm</InputLabel>
              <Select value={selectedYear} label="Năm" onChange={(e) => setSelectedYear(e.target.value)} sx={{ height: 40 }}>
                {["2025", "2024", "2023"].map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box display="flex" gap={4} mb={2} flexWrap="wrap">
            {["MB2000", "MB", "TECHCOMBANK"].map((bank) => {
              const total = summaryData.reduce((sum, row) => sum + (row[bank] || 0), 0);
              const colorMap = {
                MB: "#4caf50",
                MB2000: "#ff9800",
                TECHCOMBANK: "#2196f3",
              };

              return (
                <Typography key={bank} variant="body1" sx={{ color: colorMap[bank], fontWeight: "bold" }}>
                  {bank}: {total.toLocaleString()} VNĐ
                </Typography>
              );
            })}
          </Box>

          <Paper sx={{ p: 2 }}>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={summaryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} barCategoryGap="20%" barGap={8}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={(m) => `Tháng ${m}`} />
                <YAxis tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(0)} tỷ`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="MB" fill="#4caf50" name="MB" />
                <Bar dataKey="MB2000" fill="#ff9800" name="MB2000" />
                <Bar dataKey="TECHCOMBANK" fill="#2196f3" name="TECHCOMBANK" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      )}

      {/* Announcement + Report */}
      <Box display="flex" flexDirection={isMobile ? "column-reverse" : "row"} justifyContent="space-between" width="100%">
        {/* Announcement Section */}
        <Box p={2} border={1} borderColor="#FFF2F0" borderRadius={1} bgcolor="#FFF2F0" sx={{ display: "flex", flexDirection: "column", flex: 3, margin: 1, padding: 2, gap: 0.75 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom color="#F5232D" textAlign="center">
            THÔNG BÁO
          </Typography>
          <Typography variant="body2">- Không trích bất kỳ chi phí quản lý nào. 100% số tiền cộng đồng ủng hộ tới tay đối tượng và đúng mục đích.</Typography>
          <Typography variant="body2">- Cập nhật sao kê 1 lần/tuần.</Typography>
          <Typography variant="body2">- Tất cả các chuyển khoản (CK) nhầm vào tài khoản dự án, chúng tôi xin phép đưa vào nội dung xây Trường/Nhà/Cầu.</Typography>
          <Typography variant="body2">- Tìm kiếm theo nội dung CK của bạn.</Typography>
          <Typography variant="body2">
            - CK sẽ được đưa vào xây dựng công trình (CT) dựa theo nội dung CK của bạn.
            <ul>
              <li>Trong trường hợp CK của bạn được đưa vào xây CT khác với nội dung CK của bạn thì là do CT đó đã đủ tiền, dự án sẽ đưa sang CT khác cũng đang kêu gọi tại cùng thời điểm.</li>
              <li>Đối với các CK không có nội dung cụ thể, dự án sẽ chủ động đưa vào các CT dựa trên mức độ cấp thiết.</li>
            </ul>
          </Typography>
          <Typography variant="body2">
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
          borderRadius={1}
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
          <Typography variant="h4" fontWeight="bold" textAlign="center" sx={{ color: "#F5232D" }}>
            {capialSum.toLocaleString()} VNĐ
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={2} alignItems={isMobile ? "stretch" : "center"} justifyContent="space-between" width="100%" sx={{ mt: 4, mb: 4 }}>
        {/* Search */}
        <Box sx={{ width: isMobile ? "100%" : "auto", flex: isMobile ? undefined : 2 }}>
          <TextField
            value={search}
            placeholder="Tìm kiếm theo tên, mã GD, công trình"
            onChange={(e) => setSearch(e.target.value)}
            variant="outlined"
            fullWidth
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="disabled" />
                </InputAdornment>
              ),
            }}
            sx={{
              background: "#FFFFFF",
              borderRadius: "12px",
              "& .MuiOutlinedInput-root": {
                height: "40px",
              },
            }}
          />
        </Box>

        {/* Dropdowns */}
        <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent={isMobile ? "flex-start" : "space-between"} gap={2}>
          <FormControl sx={{ minWidth: 100, width: "fit-content" }}>
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
              <MenuItem value="">Tháng (Tất cả)</MenuItem>
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  Tháng {String(i + 1).padStart(2, "0")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 100, width: "fit-content" }}>
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
              <MenuItem value="">Năm (Tất cả)</MenuItem>
              {["2025", "2024", "2023"].map((y) => (
                <MenuItem key={y} value={y}>
                  Năm {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 100, width: "fit-content" }}>
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
              {["MB2000", "MB", "TECHCOMBANK"].map((_) => (
                <MenuItem key={_} value={_}>
                  {_}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Statement table */}
      <Box display="flex" flexDirection="column" gap="8px">
        <Typography variant="body2" color="red">
          *Nếu bạn xem trên điện thoại, hãy lướt sang phải để xem đầy đủ thông tin
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", width: "10%" }}>Ngày</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "10%" }}>Mã giao dịch</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "10%" }}>Số tiền</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "35%" }}>Nội dung</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "10%" }}>Công trình phân bổ</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "10%" }}>Link web công trình</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "10%" }}>Ngân hàng</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((s, i) => (
                <TableRow key={i} hover>
                  <TableCell>{s.date}</TableCell>
                  <TableCell>{s.transaction_code}</TableCell>
                  <TableCell>{s.amount}</TableCell>
                  <TableCell>{s.description}</TableCell>
                  <TableCell>{s.project_name}</TableCell>
                  <TableCell>
                    <a href={s.project_url} target="__blank">
                      <Typography variant="body2">{s.project_id}</Typography>
                    </a>
                  </TableCell>
                  <TableCell>{s.bank}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Pagination */}
      <Box display="flex" justifyContent="center">
        <Pagination count={pageCount} page={page} onChange={(event, newPage) => setPage(newPage)} shape="rounded" />
      </Box>
    </Box>
  );
}
