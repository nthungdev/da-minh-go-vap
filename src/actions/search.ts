"use server";

import { postToAppPost, queryAllPosts } from "@/utils/post";
import Fuse from "fuse.js";

const query = await queryAllPosts({
  limit: 9999,
});

const posts = query.docs.map(postToAppPost);

const postFuse = new Fuse(posts, {
  keys: ["title"],
});

export const searchPosts = async (query: string) => {
  return postFuse.search(query);
};
