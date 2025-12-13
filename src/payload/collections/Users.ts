import { onlyRoles, onlySelfAndRoles } from "@/payload/utils/access-control";
import type { CollectionConfig } from "payload";

const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  access: {
    read: onlySelfAndRoles(["admin", "manager"]),
    update: onlySelfAndRoles(["admin", "manager"]),
    create: onlyRoles(["admin"]),
    delete: onlyRoles(["admin"]),
  },
  fields: [
    {
      name: "role",
      type: "select",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Manager", value: "manager" },
        { label: "Editor", value: "editor" },
        { label: "Author", value: "author" },
      ],
      required: true,
      access: {
        update: onlyRoles(["admin"]),
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
