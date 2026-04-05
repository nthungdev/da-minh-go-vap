import { onlyRoles } from "@/payload/utils/access-control";
import { CollectionConfig } from "payload";

const SpotifyPodcasts: CollectionConfig = {
  slug: "spotifyPodcasts",
  admin: {
    useAsTitle: "label",
  },
  access: {
    read: () => true,
    update: onlyRoles(["admin", "manager"]),
  },
  fields: [
    {
      name: "label",
      type: "text",
      label: "Tên",
      required: true,
      admin: {
        description:
          "Tên để tìm kiếm và hiển thị trong admin, không ảnh hưởng đến URL của podcast.",
      },
    },
    {
      name: "spotifyId",
      type: "text",
      label: "Audio ID",
      required: true,
      admin: {
        description:
          "Ví dụ với Spotify, URL là https://open.spotify.com/episode/1234ABCD thì Audio ID là 1234ABCD.",
      },
    },
  ],
};

export default SpotifyPodcasts;
