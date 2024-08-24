import React, { useMemo } from "react";
import { StyledSelectComponent } from "./StyledComponent";
import { categoryMapping, classificationMapping, totalFundMapping, statusMapping } from "../constants";
import { provincesAndCities } from "../vietnam-provinces";

const FilterList = (props) => {
  const { categoryFilter, setCategoryFilter, classificationFilter, setClassificationFilter, totalFundFilter, setTotalFundFilter, statusFilter, setStatusFilter, provinceFilter, setProvinceFilter, provinceCount } = props;

  const selectedProvince = useMemo(() => {
    return provincesAndCities.find((i) => i.province === provinceFilter);
  }, [provincesAndCities, provinceFilter]);

  const options = useMemo(() => {
    return provincesAndCities
      .filter((i) => provinceCount[i.provinceValue] > 0)
      .sort((a, b) => provinceCount[b.provinceValue] - provinceCount[a.provinceValue])
      .map((i) => ({
        label: i.province + ` (${provinceCount[i.provinceValue] ?? 0})`,
        value: i.provinceValue,
      }));
  }, [provincesAndCities, provinceCount]);

  return (
    <>
      {categoryFilter && (
        <StyledSelectComponent
          label="Năm"
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
          value={selectedProvince ? { label: provinceFilter, value: selectedProvince.provinceValue } : null}
          onChange={(option) => setProvinceFilter(option.value === "all" ? "all" : provincesAndCities.find((i) => i.provinceValue === option.value).province)}
          options={options}
        />
      )}
    </>
  );
};

export default FilterList;
