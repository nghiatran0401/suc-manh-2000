import { ContactsOutlined, CustomerServiceOutlined } from "@ant-design/icons";

export const ProjectResource = {
  name: "du-an-2024",
  list: "/du-an-2024",
  create: "/du-an-2024/create",
  edit: "/du-an-2024/edit/:id",
  // show: "/du-an-2024/show/:id",
  meta: {
    icon: <CustomerServiceOutlined />,
    label: "Dự án 2024",
  },
};

export const PostResource = {
  name: "Post",
  list: "/post",
  show: "/post/show/:id",
  create: "/post/create",
  edit: "/post/edit/:id",
  meta: {
    icon: <ContactsOutlined />,
    label: "Post",
  },
};
