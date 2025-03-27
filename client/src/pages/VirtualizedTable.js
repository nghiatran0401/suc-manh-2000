import React, { useState } from "react";
import { AutoSizer, List, CellMeasurer, CellMeasurerCache } from "react-virtualized";
import { Box, Typography, Paper, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { keysMapping } from "./Statement";

const VirtualizedTable = ({ data }) => {
  const [expandedRow, setExpandedRow] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const columnWidths = {
    Ngày: isMobile ? 80 : 130,
    "Mã giao dịch": isMobile ? 120 : 170,
    "Số tiền": isMobile ? 80 : 100,
    "Nội dung giao dịch": isMobile ? 200 : 400,
    "Công trình phân bổ": isMobile ? 150 : 100,
    "Link web công trình": isMobile ? 150 : 100,
    "Ngân hàng": isMobile ? 80 : 100,
    // "Tháng GD": isMobile ? 80 : 100,
  };

  // Handles dynamic height for expanded rows
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
      {/* Table Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f0f0",
          fontWeight: "bold",
        }}
      >
        {Object.values(keysMapping).map((title, index) => (
          <Typography
            key={index}
            variant="body2"
            fontWeight="bold"
            sx={{
              width: columnWidths[title] || "auto",
              padding: "8px",
              whiteSpace: "normal",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {title}
          </Typography>
        ))}
      </Box>

      {/* Virtualized List */}
      <AutoSizer disableHeight>
        {({ width }) => (
          <List
            width={width}
            height={800}
            rowCount={data.length}
            rowHeight={({ index }) => (expandedRow === index ? cache.rowHeight({ index }) : 40)}
            deferredMeasurementCache={cache}
            rowRenderer={({ index, key, style, parent }) => {
              const row = data[index];
              const isExpanded = expandedRow === index;

              return (
                <CellMeasurer key={key} cache={cache} parent={parent} columnIndex={0} rowIndex={index}>
                  {({ measure }) => (
                    <div
                      style={{
                        ...style,
                        display: "flex",
                        flexDirection: "column",
                        background: index % 2 === 0 ? "#fafafa" : "#fff",
                        borderBottom: "1px solid #ddd",
                        // padding: "8px",
                        width: "100%",
                        cursor: "pointer",
                      }}
                      onClick={() => toggleRow(index)}
                    >
                      {/* Row Content (Collapsed View) */}
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          width: "100%",
                        }}
                      >
                        {Object.keys(keysMapping).map((dataKey) => {
                          if (dataKey === "project_url" && row[dataKey] !== "N/A") {
                            return (
                              <a key={dataKey} href={row[dataKey]} target="__blank">
                                <Typography
                                  ref={measure}
                                  variant="body2"
                                  sx={{
                                    width: columnWidths[keysMapping[dataKey]] || "auto",
                                    padding: "8px",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                    whiteSpace: isExpanded ? "normal" : "nowrap",
                                    wordWrap: isExpanded ? "break-word" : "normal",
                                  }}
                                >
                                  {row["project_id"]}
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
                                  whiteSpace: isExpanded ? "normal" : "nowrap", // Expand only if row is clicked
                                  wordWrap: isExpanded ? "break-word" : "normal",
                                }}
                                ref={measure}
                              >
                                {row[dataKey]}
                              </Typography>
                            );
                          }
                        })}
                      </Box>
                    </div>
                  )}
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
