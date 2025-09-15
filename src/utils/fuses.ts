import { AppPost } from "@/definitions";
import { postToAppPost } from "@/utils/post";
import { queryAllPosts } from "@/utils/post-server";
import Fuse from "fuse.js";

class Fuses {
  static #instance: Fuses;
  private postFuse?: Fuse<AppPost>;

  private constructor() {}

  public static get instance(): Fuses {
    if (!Fuses.#instance) {
      Fuses.#instance = new Fuses();
    }
    return Fuses.#instance;
  }

  async getPostFuse() {
    if (!this.postFuse) {
      const q = await queryAllPosts({ limit: 9999 });
      const posts = q.docs.map(postToAppPost);
      this.postFuse = new Fuse(posts, { keys: ["title"] });
    }
    return this.postFuse;
  }
}

export default Fuses;
