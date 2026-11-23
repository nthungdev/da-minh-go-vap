import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from "payload";
import { onlyRoles } from "@/payload/utils/access-control";
import { revalidatePath } from "@/payload/utils/data";
import type { Author } from "@/payload-types";

const authorEditors = onlyRoles(["admin", "manager", "editor", "author"]);

const Authors: CollectionConfig = {
  slug: "authors",
  labels: {
    singular: {
      en: "Author",
      vi: "Tác giả",
    },
    plural: {
      en: "Authors",
      vi: "Tác giả",
    },
  },
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: () => true,
    create: authorEditors,
    update: authorEditors,
    delete: authorEditors,
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: {
        en: "Name",
        vi: "Tên",
      },
      required: true,
      localized: true,
    },
    {
      name: "honorific",
      type: "text",
      label: {
        en: "Honorific",
        vi: "Danh xưng",
      },
      localized: true,
      admin: {
        description: "Ví dụ: Lm., Tu sĩ",
      },
    },
  ],
  hooks: {
    afterChange: [revalidateAuthorPosts],
    afterDelete: [revalidateAuthorPosts],
  },
};

const postCacheTags = ["posts", "navBar", "pages"];

/**
 * Revalidates the home page and every post page that bylines this author.
 * Post pages are route-cached (ISR) without data tags, so tags alone can't refresh them.
 */
async function revalidateAuthorPosts({
  doc,
  req,
}: Parameters<
  CollectionAfterChangeHook<Author> | CollectionAfterDeleteHook<Author>
>[0]) {
  const posts = await req.payload.find({
    collection: "posts",
    where: { authors: { in: [doc.id] } },
    select: { slug: true },
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  });

  const postPaths = posts.docs
    .filter((post) => Boolean(post.slug))
    .map((post) => `/posts/${post.slug}`);

  await Promise.all(
    ["/", ...postPaths].map((path) => revalidatePath(path, postCacheTags)),
  );
}

export default Authors;
