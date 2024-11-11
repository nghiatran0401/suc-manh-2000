import React from "react";
import { StyledSelectComponent, SELECT_TYPE } from "./StyledComponent";
import { categoryMapping, classificationMapping, totalFundMapping, statusMapping } from "../constants";

const FilterList = (props) => {
  const { category, setCategory, classification, setClassification, totalFund, setTotalFund, status, setStatus, province, setProvince, provinceCount } = props;

  return (
    <>
      {category && (
        <StyledSelectComponent
          label="Năm"
          value={Object.entries(categoryMapping).find(([value, label]) => value === category) ? { label: Object.entries(categoryMapping).find(([value, label]) => value === category)[1], value: category } : null}
          onChange={(option) => setCategory(option.value)}
          options={Object.entries(categoryMapping)
            .filter(([v, l]) => v.includes("du-an"))
            .map(([value, label]) => ({ label, value }))}
          selectType={SELECT_TYPE.FILTER}
        />
      )}

      {classification && (
        <StyledSelectComponent
          label="Loại dự án"
          value={
            Object.entries(classificationMapping).find(([value, label]) => value === classification)
              ? { label: Object.entries(classificationMapping).find(([value, label]) => value === classification)[1], value: classification }
              : null
          }
          onChange={(option) => setClassification(option.value)}
          options={Object.entries(classificationMapping).map(([value, label]) => ({ label, value }))}
          selectType={SELECT_TYPE.FILTER}
        />
      )}

      {totalFund && (
        <StyledSelectComponent
          label="Khoảng tiền"
          value={Object.entries(totalFundMapping).find(([value, label]) => value === totalFund) ? { label: Object.entries(totalFundMapping).find(([value, label]) => value === totalFund)[1], value: totalFund } : null}
          onChange={(option) => setTotalFund(option.value)}
          options={Object.entries(totalFundMapping).map(([value, label]) => ({ label, value }))}
          selectType={SELECT_TYPE.FILTER}
        />
      )}

      {status && (
        <StyledSelectComponent
          label="Tiến độ"
          value={Object.entries(statusMapping).find(([value, label]) => value === status) ? { label: Object.entries(statusMapping).find(([value, label]) => value === status)[1], value: status } : null}
          onChange={(option) => setStatus(option.value)}
          options={Object.entries(statusMapping).map(([value, label]) => ({ label, value }))}
          selectType={SELECT_TYPE.FILTER}
        />
      )}

      {province && (
        <StyledSelectComponent
          label="Tỉnh"
          value={Object.entries(provinceCount).find(([p, count]) => p === province) ? { label: province, value: province } : null}
          onChange={(option) => setProvince(option.value)}
          options={Object.entries(provinceCount)
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([p, count]) => ({ label: `${p} (${count})`, value: p }))}
          selectType={SELECT_TYPE.FILTER}
        />
      )}
    </>
  );
};

export default FilterList;
