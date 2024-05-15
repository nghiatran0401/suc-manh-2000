import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      table : {
        actions: "Tùy chọn",
        id: "ID",
        service: "Dịch vụ",
        name: "Tên dự án",
        time: 'Thời gian hoàn thành',
        category: "Phân loại",
        style: "Phong cách",
      },
      projects: {
        fields: {
          id: "ID",
          time: "Thời gian hoàn thành",
          name: "Tên dự án",
          description: "Mô tả",
          thumbnailUrl: "Ảnh đại diện",
          imgUrls: "Bộ sưu tập",
          category: "Phân loại",
          style: "Phong cách",
          detail: "Bài viết",
        },
      },
      constructions: {
        fields: {
          id: "ID",
          time: "Thời gian hoàn thành",
          name: "Tên dự án",
          description: "Mô tả",
          thumbnailUrl: "Ảnh đại diện",
          imgUrls: "Bộ sưu tập",
          category: "Phân loại",
          style: "Phong cách",
          detail: "Bài viết",
        },
      },
      services: {
        fields: {
          id: "ID",
          service: "Tên dịch vụ",
          thumbnailUrl: "Ảnh đại diện",
          price: "Giá cho mỗi m2",
          htmlContent: 'Bảng giá'
        },
      },
      // English translation resources
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
