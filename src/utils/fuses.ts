import { AppPost } from "@/definitions";
import { Locale } from "@/i18n/config";
import { postToAppPost } from "@/utils/post";
import { queryAllPosts } from "@/utils/post-server";
import Fuse from "fuse.js";

class Fuses {
  static #instance: Fuses;
  private postFuse?: Fuse<AppPost>;
  private postFuses: Record<Locale, Fuse<AppPost>> = Object();

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

  async getPostFuseByLocale(locale: Locale) {
    if (!this.postFuses[locale]) {
      const q = await queryAllPosts({ limit: 9999, locale });
      const posts = q.docs.map(postToAppPost);
      this.postFuses[locale] = new Fuse(posts, { keys: ["title"] });
    }
    return this.postFuses[locale];
  }

  async addPost(post: AppPost, locale: Locale) {
    const fuse = this.postFuses[locale];
    if (!fuse) return;
    fuse.add(post);
  }

  async replacePost(post: AppPost, locale: Locale) {
    const fuse = this.postFuses[locale];
    if (!fuse) return;
    fuse.remove((p) => p.id === post.id);
    fuse.add(post);
  }
}

export default Fuses;
