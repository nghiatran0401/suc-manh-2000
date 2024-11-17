import React, { useState } from "react";
import { Box, Paper, InputBase, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Button, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DESKTOP_WIDTH, SERVER_URL } from "../constants";
import axios from "axios";
import * as XLSX from "xlsx";

function extractFolderId(ggDriveUrl) {
  const match = ggDriveUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  const folderId = match ? match[1] : undefined;
  return folderId;
}

export default function ChamPhamTool() {
  const [ggDriveUrl, setGgDriveUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [allFileNames, setAllFileNames] = useState([]);

  const onSearch = async (e) => {
    setLoading(true);
    const folderId = extractFolderId(ggDriveUrl);
    if (folderId) {
      axios
        .post(SERVER_URL + "/script/chamPhamTool", { folderId })
        .then((res) => {
          setAllFileNames(res.data);
          setLoading(false);
        })
        .catch((e) => console.error(e));
    }
  };

  const downloadXlsx = () => {
    const data = [];

    Object.entries(allFileNames).forEach(([folderName, folderContent]) => {
      if (folderName !== "files" && folderContent.files) {
        folderContent.files.forEach((file) => {
          data.push({ folder: folderName, ...file });
        });
      }
    });

    const worksheetData = [[...Object.keys(data[0] || {})], ...data.map((row) => [...Object.values(row)])];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Files");

    XLSX.writeFile(workbook, "ProjectFiles.xlsx");
  };

  return (
    <Box maxWidth={DESKTOP_WIDTH} minHeight={"500px"} m={"24px auto"} display={"flex"} flexDirection={"column"} gap={"40px"}>
      <h2>Châm Phạm Tool</h2>

      <Paper
        component="form"
        sx={{
          p: "2px 4px",
          m: "0px auto",
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
      >
        <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Nhập link Google Drive ạ" inputProps={{ "aria-label": "search" }} value={ggDriveUrl} onChange={(e) => setGgDriveUrl(e.target.value)} />

        <IconButton type="button" sx={{ p: "10px" }} aria-label="search" disabled={!ggDriveUrl} onClick={onSearch}>
          <SearchIcon sx={{ color: "red" }} />
        </IconButton>
      </Paper>

      {loading && (
        <Box minHeight={"500px"} mt={"200px"}>
          <LinearProgress />
        </Box>
      )}

      {Object.keys(allFileNames).length > 0 && (
        <>
          <Button variant="contained" sx={{ width: "fit-content" }} onClick={downloadXlsx}>
            Download XLSX file
          </Button>

          {Object.entries(allFileNames).map(([folderName, folderContent], folderIndex) => (
            <Box key={folderIndex} mb={4}>
              {folderName !== "files" && (
                <>
                  <Typography variant="h6" gutterBottom>
                    {folderName}
                  </Typography>

                  {folderContent.files && folderContent.files.length > 0 ? (
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            {Object.keys(folderContent.files[0]).map((key) => (
                              <TableCell key={key}>{key}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {folderContent.files.map((file, index) => (
                            <TableRow key={index}>
                              {Object.values(file).map((value, idx) => (
                                <TableCell key={idx}>{value}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No files available.
                    </Typography>
                  )}
                </>
              )}
            </Box>
          ))}
        </>
      )}
    </Box>
  );
}
