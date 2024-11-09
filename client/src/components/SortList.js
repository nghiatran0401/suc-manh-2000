import React from "react";
import { StyledSelectComponent } from "./StyledComponent";
import { sortOptionsMapping } from "../constants";

const SortList = (props) => {
  const { 
    setSortField,
  } = props;

  return (
    <StyledSelectComponent
      label="Sắp xếp"
      onChange={(option) => setSortField(option.value)}
      options={Object.entries(sortOptionsMapping).map(([value, label]) => ({
        label,
        value,
      }))}
    />
  );
};

export default SortList;