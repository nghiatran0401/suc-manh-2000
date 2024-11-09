import React from "react";
import { StyledSelectComponent } from "./StyledComponent";
import { sortOptionsMapping } from "../constants";

const SortList = (props) => {
  return (
    <StyledSelectComponent
      label="Sắp xếp"
      options={Object.entries(sortOptionsMapping).map(([value, label]) => ({
        label,
        value,
      }))}
    />
  );
};

export default SortList;