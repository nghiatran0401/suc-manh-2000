import { useState } from "react"

const usePostSort = () => {
  const [sortField, setSortField] = useState("createdAt");
  return { sortField, setSortField };
}

export default usePostSort;


