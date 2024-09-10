import * as React from "react";
import { useMediaQuery, Stack, Typography } from "@mui/material";
import Select from "react-select";
import { useTheme } from "@mui/material/styles";

export const StyledSelectComponent = (props) => {
  const { label, onChange, options, value } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Stack display={"flex"} direction={"column"} spacing={0.5}>
      <Typography color={"rgba(0, 0, 0, 0.5)"} variant="subtitle2">
        {label}
      </Typography>

      <Select
        placeholder={"Tất cả"}
        value={value}
        onChange={onChange}
        options={[{ label: "Tất cả", value: "all" }, ...options]}
        styles={{
          container: (provided) => ({ ...provided, width: isMobile ? 130 : 180 }),
        }}
      />
    </Stack>
  );
};
