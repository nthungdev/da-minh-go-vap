import { Block } from "payload";

const SpotifyPodcastListBlock: Block = {
  slug: "spotifyPodcastList",
  interfaceName: "SpotifyPodcastList",
  fields: [
    {
      name: "episodes",
      type: "array",
      label: "Danh sách podcast",
      fields: [
        {
          name: "label",
          type: "text",
          label: "Tên",
          required: true,
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
    },
    {
      name: "pageSize",
      type: "number",
      label: "Số podcast mỗi trang",
      defaultValue: 10,
      min: 1,
      admin: {
        description: "Số lượng podcast hiển thị trên một trang.",
      },
    },
  ],
};

export default SpotifyPodcastListBlock;
