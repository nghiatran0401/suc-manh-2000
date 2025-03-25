import React, { useState } from "react";
import { AutoSizer, List, CellMeasurer, CellMeasurerCache } from "react-virtualized";
import { Box, Typography, Paper, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const VirtualizedTable = ({ filteredData, keysMapping }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Total width: 1100px
  const columnWidths = {
    Ngày: isMobile ? 80 : 130,
    "Mã giao dịch": isMobile ? 120 : 170,
    "Số tiền": isMobile ? 80 : 100,
    "Nội dung giao dịch": isMobile ? 200 : 400,
    "Công trình": isMobile ? 150 : 100,
    "Ngân hàng": isMobile ? 80 : 100,
    "Tháng GD": isMobile ? 80 : 100,
  };

  const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 40,
    minHeight: 40,
  });

  const toggleRow = (index) => {
    setExpandedRow((prev) => (prev === index ? null : index));
    cache.clear(index);
  };

  return (
    <Box sx={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
      {/* Virtualized Header */}
      <Box
        sx={{
          display: "flex",
          background: "#f0f0f0",
          fontWeight: "bold",
        }}
      >
        {Object.values(keysMapping).map(
          (title, index) =>
            title !== "Link" && (
              <Typography
                key={index}
                variant="body2"
                fontWeight="bold"
                sx={{
                  width: columnWidths[title] || "auto",
                  padding: "8px",
                  // borderRight: index !== Object.values(keysMapping).length - 1 ? "1px solid #bbb" : "none",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {title}
              </Typography>
            )
        )}
      </Box>

      {/* Virtualized List */}
      <AutoSizer disableHeight>
        {({ width }) => (
          <List
            width={width}
            height={800}
            rowCount={filteredData.length}
            rowHeight={cache.rowHeight}
            deferredMeasurementCache={cache}
            rowRenderer={({ index, key, style, parent }) => {
              const row = filteredData[index];
              // const isExpanded = expandedRow === index;

              return (
                <CellMeasurer key={key} cache={cache} parent={parent} columnIndex={0} rowIndex={index}>
                  <div
                    style={{
                      ...style,
                      display: "flex",
                      alignItems: "center",
                      // cursor: "pointer",
                      background: index % 2 === 0 ? "#fafafa" : "#fff",
                      borderBottom: "1px solid #ddd",
                      // padding: "8px",
                      flexDirection: "column",
                    }}
                    onClick={() => toggleRow(index)}
                  >
                    {/* Row (collapsed view) */}
                    <Box sx={{ display: "flex", width: "100%" }}>
                      {Object.keys(keysMapping).map((dataKey, colIndex) => {
                        if (dataKey === "allocated_project") return;

                        if (dataKey === "project") {
                          return (
                            <a href={row["allocated_project"]} target="__blank">
                              <Typography
                                key={dataKey}
                                variant="body2"
                                sx={{
                                  width: columnWidths[keysMapping[dataKey]] || "auto",
                                  padding: "8px",
                                  textOverflow: "ellipsis",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  // fontSize: isMobile ? "0.7rem" : "1rem",
                                  // borderRight: colIndex !== Object.keys(keysMapping).length - 1 ? "1px solid #bbb" : "none",
                                }}
                              >
                                {row[dataKey]}
                              </Typography>
                            </a>
                          );
                        } else {
                          return (
                            <Typography
                              key={dataKey}
                              variant="body2"
                              sx={{
                                width: columnWidths[keysMapping[dataKey]] || "auto",
                                padding: "8px",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                // fontSize: isMobile ? "0.7rem" : "1rem",
                                // borderRight: colIndex !== Object.keys(keysMapping).length - 1 ? "1px solid #bbb" : "none",
                              }}
                            >
                              {row[dataKey]}
                            </Typography>
                          );
                        }
                      })}
                    </Box>

                    {/* Expanded details, only visible if expanded */}
                    {/* {isExpanded && (
                      <Paper sx={{ padding: "12px", marginTop: "8px", width: "100%" }}>
                        <Typography variant="body2">
                          {Object.keys(keysMapping).map((dataKey) => (
                            <div key={dataKey} style={{ marginBottom: "8px" }}>
                              <strong>{keysMapping[dataKey]}: </strong>
                              {row[dataKey]}
                            </div>
                          ))}
                        </Typography>
                      </Paper>
                    )} */}
                  </div>
                </CellMeasurer>
              );
            }}
            overscanRowCount={5}
          />
        )}
      </AutoSizer>
    </Box>
  );
};

export default React.memo(VirtualizedTable);
