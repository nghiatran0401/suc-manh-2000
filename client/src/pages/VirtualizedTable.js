import React, { useState, useCallback } from "react";
import { AutoSizer, List, CellMeasurer, CellMeasurerCache } from "react-virtualized";
import { Box, Collapse, Typography, Paper, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const VirtualizedTable = ({ filteredData, keysMapping }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const columnWidths = {
    Ngày: isMobile ? 80 : 100,
    "Mã giao dịch": isMobile ? 120 : 150,
    "Số tiền": isMobile ? 80 : 100,
    "Nội dung giao dịch": isMobile ? 200 : 400,
    "Công trình": isMobile ? 150 : 150,
    Link: isMobile ? 80 : 100,
    "Ngân hàng": isMobile ? 80 : 100,
    "Tháng GD": isMobile ? 80 : 100,
  };

  const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 40,
    minHeight: 40,
  });

  const toggleRow = useCallback((index) => {
    setExpandedRow((prev) => (prev === index ? null : index));
    cache.clear(index);
  }, []);

  const rowRenderer = ({ index, key, style, parent }) => {
    const isExpanded = expandedRow === index;

    return (
      <CellMeasurer key={key} cache={cache} parent={parent} columnIndex={0} rowIndex={index}>
        <div style={{ ...style, borderBottom: "1px solid #ddd" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              background: index % 2 === 0 ? "#fafafa" : "#fff",
              padding: isMobile ? "12px" : "8px",
            }}
            onClick={() => toggleRow(index)}
          >
            {Object.keys(keysMapping).map((key) => (
              <div
                key={key}
                style={{
                  width: columnWidths[keysMapping[key]] || "auto",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  fontSize: isMobile ? "0.8rem" : "1rem",
                }}
              >
                {key === "allocated_project" ? (
                  filteredData[index][key] !== "N/A" ? (
                    <a href={filteredData[index][key]} target="_blank" rel="noopener noreferrer">
                      {filteredData[index][key]?.split("/").pop().toUpperCase() ?? "N/A"}
                    </a>
                  ) : (
                    "N/A"
                  )
                ) : (
                  filteredData[index][key]
                )}
              </div>
            ))}
          </div>

          {isExpanded && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Paper
                elevation={1}
                style={{
                  padding: "12px",
                  marginTop: "8px",
                  background: "#fff",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <Typography
                  variant="body1"
                  style={{
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    fontSize: isMobile ? "0.8rem" : "1rem",
                  }}
                >
                  {Object.keys(keysMapping).map((key) => (
                    <div key={key} style={{ marginBottom: "8px" }}>
                      <strong>{keysMapping[key]}: </strong>
                      {key === "allocated_project" ? (
                        filteredData[index][key] !== "N/A" ? (
                          <a href={filteredData[index][key]} target="_blank" rel="noopener noreferrer">
                            {filteredData[index][key]?.split("/").pop().toUpperCase() ?? "N/A"}
                          </a>
                        ) : (
                          "N/A"
                        )
                      ) : (
                        filteredData[index][key]
                      )}
                    </div>
                  ))}
                </Typography>
              </Paper>
            </Collapse>
          )}
        </div>
      </CellMeasurer>
    );
  };

  return (
    <Box height={600} style={{ border: "1px solid #ddd", borderRadius: "8px" }}>
      <div
        style={{
          display: "flex",
          background: "#f0f0f0",
          padding: "8px",
          borderBottom: "1px solid #ddd",
          fontWeight: "bold",
        }}
      >
        {Object.values(keysMapping).map((title, index) => (
          <div
            key={index}
            style={{
              width: columnWidths[title] || "auto",
              textAlign: "left",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              fontSize: isMobile ? "0.8rem" : "1rem",
            }}
          >
            {title}
          </div>
        ))}
      </div>

      <AutoSizer>
        {({ height, width }) => <List width={width} height={height - 40} rowCount={filteredData.length} rowHeight={cache.rowHeight} deferredMeasurementCache={cache} rowRenderer={rowRenderer} overscanRowCount={5} />}
      </AutoSizer>
    </Box>
  );
};

export default React.memo(VirtualizedTable);
