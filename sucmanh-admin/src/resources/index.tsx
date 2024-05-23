import { ContactsOutlined, CustomerServiceOutlined, } from "@ant-design/icons";

export const ProjectResource = {
  name: "projects",
  list: "/projects",
  show: "/projects/show/:id",
  create: "/projects/create",
  edit: "/projects/edit/:id",
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
