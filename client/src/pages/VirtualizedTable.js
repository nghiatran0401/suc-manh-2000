import React, { useState, useCallback } from "react";
import { AutoSizer, List } from "react-virtualized";
import { Box, Collapse, Typography, Paper } from "@mui/material";
import { CellMeasurer, CellMeasurerCache } from "react-virtualized";

const VirtualizedTable = ({ filteredData, keysMapping }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  // Cache to handle dynamic row heights
  const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 40,
    minHeight: 40,
  });

  // Toggle expanded row
  const toggleRow = useCallback((index) => {
    setExpandedRow((prev) => (prev === index ? null : index));
    cache.clear(index); // Clear cache for the expanded row
  }, []);

  // Row renderer
  const rowRenderer = ({ index, key, style, parent }) => {
    const isExpanded = expandedRow === index;

    return (
      <CellMeasurer key={key} cache={cache} parent={parent} columnIndex={0} rowIndex={index}>
        <div style={{ ...style, borderBottom: "1px solid #ddd" }}>
          {/* Row Content */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              background: index % 2 === 0 ? "#fafafa" : "#fff",
              padding: "8px",
            }}
            onClick={() => toggleRow(index)}
          >
            {Object.keys(keysMapping).map((key) => (
              <div
                key={key}
                style={{
                  flex: 1,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {filteredData[index][key]}
              </div>
            ))}
          </div>

          {/* Expanded Content */}
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
                  }}
                >
                  {/* Render full content for all keys */}
                  {Object.keys(keysMapping).map((key) => (
                    <div key={key} style={{ marginBottom: "8px" }}>
                      <strong>{keysMapping[key]}:</strong> {filteredData[index][key]}
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
      {/* Table Header */}
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
              flex: 1,
              textAlign: "left",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </div>
        ))}
      </div>

      {/* Table Body */}
      <AutoSizer>
        {({ height, width }) => (
          <List
            width={width}
            height={height - 40} // Subtract header height
            rowCount={filteredData.length}
            rowHeight={cache.rowHeight} // Use cached row height
            deferredMeasurementCache={cache}
            rowRenderer={rowRenderer}
            overscanRowCount={5} // Render extra rows for smooth scrolling
          />
        )}
      </AutoSizer>
    </Box>
  );
};

export default React.memo(VirtualizedTable);
