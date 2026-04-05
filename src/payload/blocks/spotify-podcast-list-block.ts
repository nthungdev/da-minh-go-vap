import { Block } from "payload";

const SpotifyPodcastListBlock: Block = {
  slug: "spotifyPodcastList",
  interfaceName: "SpotifyPodcastList",
  fields: [
    {
      name: "pageSize",
      type: "number",
      label: "Số podcast mỗi trang",
      defaultValue: 10,
      admin: {
        description: "Số lượng podcast hiển thị trên một trang.",
      },
    },
  ],
};

export default SpotifyPodcastListBlock;
