import { ContactsOutlined, CustomerServiceOutlined } from "@ant-design/icons";

export const ProjectResource = {
  name: "du-an-2024",
  list: "/du-an-2024",
  // show: "/du-an-2024/:id",
  create: "/projects/create",
  edit: "/du-an-2024/edit/:id",
  meta: {
    icon: <CustomerServiceOutlined />,
    label: "Project",
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
