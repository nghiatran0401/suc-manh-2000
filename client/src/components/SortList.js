import React from "react";
import { StyledSelectComponent, SELECT_TYPE } from "./StyledComponent";
import { sortOptionsMapping } from "../constants";

const SortList = (props) => {
  const { sortField, setSortField } = props;

  return (
    <StyledSelectComponent
      label="Sắp xếp"
      value={{ label: sortOptionsMapping[sortField], value: sortField }}
      onChange={(option) => setSortField(option.value)}
      options={Object.entries(sortOptionsMapping).map(([value, label]) => ({ label, value }))}
      selectType={SELECT_TYPE.SORT}
    />
  );
};

export default SortList;
