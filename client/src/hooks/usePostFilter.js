import { useState } from "react";

const usePostFilter = () => {
  const [filters, setFilters] = useState({
    category: "all",
    classification: "all",
    totalFund: "all",
    status: "all",
    province: "all",
  });
  return { filters, setFilters };
};

export default usePostFilter;
