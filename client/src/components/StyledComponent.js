import * as React from "react";
import { styled } from "@mui/material/styles";
import { Box, IconButton, MenuItem, Select, Stack, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export const StyledSelect = styled(Select)({
  width: "200px",
  borderRadius: "8px",
  ".MuiSelect-select": {
    fontSize: "14px",
    fontWeight: 500,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#D4D4D4",
  },
  ".MuiPopover-paper": {
    backgroundColor: "red",
    boxShadow: "0px 2px 6px 2px rgba(0, 0, 0, 0.15) !important",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#A4A4A4",
  },
  "&:focus .MuiOutlinedInput-notchedOutline": {
    borderColor: "transparent",
  },
  "&:active .MuiOutlinedInput-notchedOutline": {
    borderColor: "transparent",
  },
  "&:visited .MuiOutlinedInput-notchedOutline": {
    borderColor: "transparent",
  },
  "&:target .MuiOutlinedInput-notchedOutline": {
    borderColor: "transparent",
  },
});

export const StyledSelectItem = styled(MenuItem)(({ theme }) => ({
  fontSize: "14px",
  fontWeight: 500,
  paddingLeft: "34px",
}));

export const StyledSelectedItem = (props) => {
  return (
    <StyledSelectItem sx={{ paddingLeft: "12px", paddingRight: "24px" }} key={props.value} value={props.value}>
      <Stack direction={"row"} alignItems={"center"}>
        <Box sx={{ marginRight: "7.5px" }}>
          <CheckIcon />
        </Box>
        {props.label}
      </Stack>
    </StyledSelectItem>
  );
};

export const StyledSelectComponent = (props) => {
  const { size, inputWidth, value, label, onChange, options, isMobile } = props;

  return (
    <Stack display={"flex"} direction={"column"} spacing={0.5}>
      {label && (
        <Typography color={"rgba(0, 0, 0, 0.5)"} variant="subtitle2" width={isMobile ? "100px" : "max-content"}>
          {label}
        </Typography>
      )}
      <StyledSelect
        renderValue={(value) => {
          return <Typography variant="body1"> {options.find((option) => option.value === value)?.label ?? ""}</Typography>;
        }}
        MenuProps={{
          sx: {
            transform: inputWidth ? "" : "translateX(-25px)",
          },
        }}
        displayEmpty
        sx={{
          width: inputWidth,
          height: size == "large" ? "56px" : "40px",
        }}
        value={value}
        IconComponent={(params) => {
          return (
            <IconButton
              sx={{
                top: "0 !important",
                right: "0 !important",
                bottom: "0 !important",
              }}
              className={params.className}
              disableRipple
            >
              <KeyboardArrowDownIcon sx={{ fontSize: "16px" }} />
            </IconButton>
          );
        }}
        onChange={onChange}
      >
        {options.map((option) => {
          if (option.value === value)
            return (
              <StyledSelectedItem
                key={option.value}
                value={option.value}
                label={
                  <Stack>
                    <Typography fontSize={14} fontWeight={500}>
                      {option.label}
                    </Typography>
                    {option.description && (
                      <Box>
                        <Typography
                          sx={{
                            width: "200px",
                            whiteSpace: "pre-wrap",
                          }}
                          color={"rgba(0, 0, 0, 0.6)"}
                          fontSize={12}
                          fontWeight={400}
                        >
                          {option.description}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                }
              />
            );
          return (
            <StyledSelectItem
              key={option.value}
              sx={{
                paddingRight: "24px",
              }}
              value={option.value}
            >
              <Stack>
                <Typography fontSize={14} fontWeight={500}>
                  {option.label}
                </Typography>
                {option.description && (
                  <Box>
                    <Typography
                      sx={{
                        width: "200px",
                        whiteSpace: "pre-wrap",
                      }}
                      color={"rgba(0, 0, 0, 0.6)"}
                      fontSize={12}
                      fontWeight={400}
                    >
                      {option.description}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </StyledSelectItem>
          );
        })}
      </StyledSelect>
    </Stack>
  );
};
