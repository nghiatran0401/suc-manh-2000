import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      table: {
        id: "ID",
        name: "Tên dự án",
        search: "Tìm kiếm",
        category: "Danh mục",
        publish_date: "Ngày tạo",
        actions: "Tùy chọn",
      },
      post: {
        fields: {
          id: "ID",
          author: "Tác giả",
          publish_date: "Ngày tạo",
          name: "Tên dự án",
          url: "Link",
          slug: "Slug",
          category: "Danh mục",
          thumbnail: "Ảnh đại diện",
          description: "Mô tả",
          classification: "Phân loại",
          donor: {
            name: "Nhà tài trợ",
            description: "Mô tả",
            images: "Ảnh",
          },
          progress: {
            name: "Tiến độ dự án",
            images1: "Ảnh hiện trạng",
            images2: "Ảnh tiến độ",
            images3: "Ảnh hoàn thiện",
          },
          content: {
            name: "Nội dung",
            description: "Mô tả",
            images: "Ảnh",
            section1: "Hoàn cảnh",
            section2: "Nhà hảo tâm",
            section3: "Mô hình xây",
          },
        },
      },
    },
  },
  // Add other language translations here
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // Default language
  fallbackLng: "en", // Fallback language in case a translation is missing
  interpolation: {
    escapeValue: false, // React already escapes values by default
  },
});

export default i18n;
