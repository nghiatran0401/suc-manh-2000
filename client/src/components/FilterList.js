import React from "react";
import { StyledSelectComponent } from "./StyledComponent";
import { categoryMapping, classificationMapping, totalFundMapping, statusMapping } from "../constants";
import { provincesAndCities } from "../vietnam-provinces";

const FilterList = (props) => {
  const { categoryFilter, setCategoryFilter, classificationFilter, setClassificationFilter, totalFundFilter, setTotalFundFilter, statusFilter, setStatusFilter, provinceFilter, setProvinceFilter, provinceCount } = props;

  return (
    <>
      {categoryFilter && (
        <StyledSelectComponent
          label="Danh mục"
          value={
            Object.entries(categoryMapping).find(([value, label]) => value === categoryFilter)
              ? { label: Object.entries(categoryMapping).find(([value, label]) => value === categoryFilter)[1], value: categoryFilter }
              : null
          }
          onChange={(option) => setCategoryFilter(option.value)}
          options={Object.entries(categoryMapping)
            .filter(([v, l]) => v.includes("du-an"))
            .map(([value, label]) => ({ label, value }))}
        />
      )}

      {classificationFilter && (
        <StyledSelectComponent
          label="Loại dự án"
          value={
            Object.entries(classificationMapping).find(([value, label]) => value === classificationFilter)
              ? { label: Object.entries(classificationMapping).find(([value, label]) => value === classificationFilter)[1], value: classificationFilter }
              : null
          }
          onChange={(option) => setClassificationFilter(option.value)}
          options={Object.entries(classificationMapping).map(([value, label]) => ({ label, value }))}
        />
      )}

      {totalFundFilter && (
        <StyledSelectComponent
          label="Khoảng tiền"
          value={
            Object.entries(totalFundMapping).find(([value, label]) => value === totalFundFilter)
              ? { label: Object.entries(totalFundMapping).find(([value, label]) => value === totalFundFilter)[1], value: totalFundFilter }
              : null
          }
          onChange={(option) => setTotalFundFilter(option.value)}
          options={Object.entries(totalFundMapping).map(([value, label]) => ({ label, value }))}
        />
      )}

      {statusFilter && (
        <StyledSelectComponent
          label="Tiến độ"
          value={Object.entries(statusMapping).find(([value, label]) => value === statusFilter) ? { label: Object.entries(statusMapping).find(([value, label]) => value === statusFilter)[1], value: statusFilter } : null}
          onChange={(option) => setStatusFilter(option.value)}
          options={Object.entries(statusMapping).map(([value, label]) => ({ label, value }))}
        />
      )}

      {provinceFilter && (
        <StyledSelectComponent
          label="Tỉnh"
          value={
            provincesAndCities.find((i) => i.provinceValue === provinceFilter)
              ? { label: provincesAndCities.find((i) => i.provinceValue === provinceFilter).province, value: provincesAndCities.find((i) => i.provinceValue === provinceFilter).provinceValue }
              : null
          }
          onChange={(option) => setProvinceFilter(option.value)}
          options={provincesAndCities.map((i) => ({
            label: i.province + ` (${provinceCount[i.provinceValue] ?? 0})`,
            value: i.provinceValue,
          }))}
        />
      )}
    </>
  );
};

export default FilterList;
