import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      table : {
        actions: "Tùy chọn",
        id: "ID",
        name: "Tên dự án",
        time: 'Thời gian hoàn thành',
        category: "Danh mục",
        publish_date: "Ngày tạo",
        slug: "Slug",
        author: "Tác giả",
      },
      projects: {
        fields: {
          id: "ID",
          publish_date: "Thời gian hoàn thành",
          name: "Tên dự án",
          description: "Mô tả",
          slug: "Slug",
          category: "Danh mục",
          tabs: "Tabs",
          donor: "Mạnh thường quân",
          progress: "Tiến độ",
          thumbnailUrl: "Ảnh đại diện",
          body: "Bài viết",
          logo: "LOGO",
          stage: "Giai đoạn",
          images: 'Ảnh',
          tab_name: "Tên tab",
          content: "Bài viết",
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
