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
        createdAt: "Ngày đăng bài",
        actions: "Tùy chọn",
      },
      post: {
        fields: {
          id: "ID",
          author: "Tác giả",
          createdAt: "Ngày đăng bài",
          name: "Tên dự án",
          url: "Link",
          slug: "Slug",
          category: "Danh mục",
          thumbnail: "Ảnh đại diện",
          description: "Mô tả",
          classification: "Phân loại",
          totalFund: "Tổng tiền",
          status: "Trạng thái",
          province: "Tỉnh",
          district: "Quận/Huyện",
          distanceToHCMC: "Khoảng cách đến TP.HCM",
          distanceToHN: "Khoảng cách đến Hà Nội",
          start_date: "Ngày khởi công",
          end_date: "Ngày khánh thành",
          donor: {
            section: "Section Nhà tài trợ",
            id: "Donor ID",
            name: "Nhà tài trợ",
            type: "Loại",
            description: "Mô tả / Giới thiệu",
            logo: "Logo",
          },
          donation: {
            id: "Donation ID",
            amount: "Số tiền tài trợ",
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
