import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      table: {
        id: "ID",
        name: "Tên dự án",
        category: "Danh mục",
        publish_date: "Ngày tạo",
        actions: "Tùy chọn",
      },
      projects: {
        fields: {
          id: "ID",
          author: "Tác giả",
          publish_date: "Ngày tạo",
          name: "Tên dự án",
          slug: "Slug",
          category: "Danh mục",
          description: "Mô tả",
          classification: "Phân loại",
          donor: {
            name: "Nhà tài trợ",
            description: "Mô tả",
            image: "Ảnh",
          },
          progress: {
            name: "Tiến độ",
            section1: "Ảnh hiện trạng",
            section2: "Ảnh tiến độ",
            section3: "Ảnh hoàn thiện",
          },
          content: {
            name: "Nội dung",
            section1: "Hoàn cảnh",
            section2: "Nhà hảo tâm",
            section3: "Mô hình xây",
            description: "Mô tả",
            embedded_url: "URL nhúng",
            slide_show: {
              image: "Ảnh",
              caption: "Chú thích",
            },
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
