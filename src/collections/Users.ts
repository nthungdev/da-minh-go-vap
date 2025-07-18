import type { CollectionConfig } from "payload";

const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      return true;
    },
    update: ({ req, id }) => {
      if (!req.user) return false;
      if (req.user.role === "admin") return true;
      // Allow users to update their own data
      if (req.user.id === id) return true;
      return false;
    },
    create: ({ req }) => {
      return req?.user?.role === "admin";
    },
    delete: ({ req }) => {
      return req?.user?.role === "admin";
    },
  },
  fields: [
    {
      name: "role",
      type: "select",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      required: true,
      access: {
        update: ({ req }) => {
          return req?.user?.role === "admin";
        },
      },
    },
    {
      name: "firstName",
      type: "text",
    },
    {
      name: "lastName",
      type: "text",
    },
  ],
};

export default Users;
