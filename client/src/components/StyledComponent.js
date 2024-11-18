import * as React from "react";
import { useMediaQuery, Stack, Typography } from "@mui/material";
import Select from "react-select";
import { useTheme } from "@mui/material/styles";

export const SELECT_TYPE = {
  FILTER: "filter",
  SORT: "sort",
};

export const StyledSelectComponent = (props) => {
  const { label, onChange, options, value, selectType } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  let selectOptions;
  let placeholder;
  switch (selectType) {
    case SELECT_TYPE.FILTER:
      selectOptions = [{ label: "Tất cả", value: "all" }, ...options];
      placeholder = "Tất cả";
      break;
    case SELECT_TYPE.SORT:
      selectOptions = options;
      placeholder = "Mới nhất";
      break;
    default:
      break;
  }

  return (
    <Stack display={"flex"} direction={"column"} spacing={0.5}>
      <Typography color={"rgba(0, 0, 0, 0.5)"} variant="subtitle2">
        {label}
      </Typography>

      <Select
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        options={selectOptions}
        styles={{
          container: (provided) => ({ ...provided, width: isMobile ? 130 : 180 }),
        }}
      />
    </Stack>
  );
};
