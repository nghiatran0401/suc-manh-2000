import { DataProvider } from "@refinedev/core";
import { axiosInstance } from "@refinedev/simple-rest";

const customDataProvider = (apiUrl: string, httpClient: any): DataProvider => ({
  getList: async ({ resource, pagination, filters }) => {
    const { data } = await httpClient.get(`${apiUrl}/${resource}`, { params: { pagination, filters } });
    return {
      data: data.posts,
      total: data.totalPosts,
    };
  },
  getOne: async ({ resource, id }) => {
    const { data } = await axiosInstance.get(`${apiUrl}/${resource}/${id}`);
    return { data };
  },
  create: async ({ resource, variables }) => {
    const res = await axiosInstance.post(`${apiUrl}/${resource}`, { ...variables });
    if (res.status === 200) {
      return res.data;
    }
  },
  update: async ({ resource, id, variables }) => {
    const res = await axiosInstance.patch(`${apiUrl}/${resource}/${id}`, { ...variables });
    if (res.status === 200) {
      return res.data;
    }
  },
  deleteOne: async ({ resource, id }) => {
    const res = await axiosInstance.delete(`${apiUrl}/${resource}/${id}`);
    if (res.status === 200) {
      return res.data;
    }
  },
  getApiUrl: function (): string {
    throw new Error("Function not implemented.");
  },
});

export default customDataProvider;
