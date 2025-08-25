"use server";

import { postToAppPost } from "@/utils/post";
import { queryAllPosts } from "@/utils/post-server";
import Fuse from "fuse.js";

const query = await queryAllPosts({ limit: 9999 });

const posts = query.docs.map(postToAppPost);

const postFuse = new Fuse(posts, { keys: ["title"] });

export const searchPosts = async (query: string) => {
  return postFuse.search(query);
};
