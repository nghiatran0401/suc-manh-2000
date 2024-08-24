import { useEffect, useState } from "react";
import { SERVER_URL } from "../constants";
import axios from "axios";

const usePostFilter = () => {
  const [filters, setFilters] = useState({
    classification: "all",
    totalFund: "all",
    status: "all",
    province: "all",
  });
  const [provinceCount, setProvinceCount] = useState({});
  useEffect(() => {
    axios
      .get(SERVER_URL + "/getClassificationAndCategoryCounts")
      .then((res) => {
        setProvinceCount(res.data.province);
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  return { filters, setFilters, provinceCount };
};

export default usePostFilter;
