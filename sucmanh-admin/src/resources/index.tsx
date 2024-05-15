import { ContactsOutlined, CustomerServiceOutlined, DropboxOutlined, } from "@ant-design/icons";

export const ProjectResource = {
  name: "projects",
  list: "/projects",
  show: "/projects/show/:id",
  create: "/projects/create",
  edit: "/projects/edit/:id",
  meta: {
    icon: <DropboxOutlined />,
    label: "Project",
  },
};

export const ConstructionResource = {
  name: "constructions",
  list: "/constructions",
  show: "/constructions/show/:id",
  create: "/constructions/create",
  edit: "/constructions/edit/:id",
  meta: {
    icon: <DropboxOutlined />,
    label: "Construction",
  },
};

export const ServiceResource = {
  name: "services",
  list: "/services",
  edit: "/services/edit/:id",
  meta: {
    icon:<CustomerServiceOutlined />,
    label: "Service",
  },
};


export const ContactResource = {
  name: "contact",
  list: "/contact",
  meta: {
    icon: <ContactsOutlined />,
    label: "Contact",
  },
};
