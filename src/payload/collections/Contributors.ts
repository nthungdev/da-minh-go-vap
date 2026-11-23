import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  FieldHook,
} from "payload";
import { defaultLocale } from "@/i18n/config";
import { onlyRoles } from "@/payload/utils/access-control";
import { revalidatePath } from "@/payload/utils/data";
import type { Contributor } from "@/payload-types";
import { slugifyVietnamese, validateSlug } from "@/utils/slug";

const contributorEditors = onlyRoles(["admin", "manager", "editor", "author"]);

const Contributors: CollectionConfig = {
  slug: "contributors",
  labels: {
    singular: {
      en: "Contributor",
      vi: "Người đóng góp",
    },
    plural: {
      en: "Contributors",
      vi: "Người đóng góp",
    },
  },
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: () => true,
    create: contributorEditors,
    update: contributorEditors,
    delete: contributorEditors,
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
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      index: true,
      validate: validateContributorSlug,
      admin: {
        position: "sidebar",
        description:
          "Tự tạo từ tên nếu để trống. Chỉ dùng chữ thường (a-z), số (0-9) và dấu gạch ngang (-)",
      },
      hooks: {
        beforeValidate: [autoGenerateSlug],
        beforeDuplicate: [appendSlugSuffix],
      },
    },
  ],
  hooks: {
    afterChange: [revalidateContributorPosts],
    afterDelete: [revalidateContributorPosts],
  },
};

const emptySlugMessage = "Không thể tạo slug từ tên này, vui lòng nhập slug";

/** Rejects empty slugs (a custom `validate` replaces Payload's `required` check). */
function validateContributorSlug(value: string | null | undefined) {
  if (!value?.trim()) return emptySlugMessage;
  return validateSlug(value);
}

function randomSlugSuffix() {
  return Math.random().toString(36).slice(-4);
}

function appendSlugSuffix({ value }: Parameters<FieldHook>[0]) {
  if (!value || typeof value !== "string") return value;
  return `${value}-${randomSlugSuffix()}`;
}

/**
 * Fills an empty slug from the default-locale name. Names aren't unique, so a
 * taken generated slug gets a short random suffix; a hand-typed duplicate is
 * left to the unique index error.
 */
async function autoGenerateSlug({
  value,
  data,
  originalDoc,
  req,
}: Parameters<FieldHook<Contributor>>[0]) {
  if (value) return value;

  let name: unknown = data?.name;
  const docId = originalDoc?.id;
  if (req.locale !== defaultLocale && docId) {
    // `data.name` holds the request locale; prefer the default-locale name when it exists.
    const defaultDoc = await req.payload.findByID({
      collection: "contributors",
      id: docId,
      locale: defaultLocale,
      fallbackLocale: false,
      depth: 0,
      overrideAccess: true,
      req,
    });
    name = defaultDoc.name || name;
  }
  if (name && typeof name === "object") {
    // `locale: "all"` writes send every locale at once
    name = (name as Record<string, unknown>)[defaultLocale];
  }
  if (typeof name !== "string") return value;

  const base = slugifyVietnamese(name);
  if (!base) return value;

  const taken = await req.payload.count({
    collection: "contributors",
    where: {
      slug: { equals: base },
      ...(docId ? { id: { not_equals: docId } } : {}),
    },
    overrideAccess: true,
    req,
  });
  return taken.totalDocs > 0 ? `${base}-${randomSlugSuffix()}` : base;
}

const postCacheTags = ["posts", "navBar", "pages"];
const revalidationBatchSize = 10;

/**
 * Revalidates the home page and every post page that credits this contributor.
 * Post pages are route-cached (ISR) without data tags, so tags alone can't refresh them.
 */
async function revalidateContributorPosts({
  doc,
  req,
}: Parameters<
  | CollectionAfterChangeHook<Contributor>
  | CollectionAfterDeleteHook<Contributor>
>[0]) {
  // The contributor is already saved; a revalidation failure must not fail the request.
  try {
    const posts = await req.payload.find({
      collection: "posts",
      where: { "contributors.person": { in: [doc.id] } },
      select: { slug: true },
      depth: 0,
      pagination: false,
      overrideAccess: true,
      req,
    });

    const postPaths = posts.docs
      .filter((post) => Boolean(post.slug))
      .map((post) => `/posts/${post.slug}`);
    const paths = ["/", ...postPaths];

    for (let i = 0; i < paths.length; i += revalidationBatchSize) {
      const batch = paths.slice(i, i + revalidationBatchSize);
      await Promise.all(
        batch.map((path) => revalidatePath(path, postCacheTags)),
      );
    }
  } catch (err) {
    req.payload.logger.error({
      err,
      msg: "Failed to revalidate contributor posts",
    });
  }
}

export default Contributors;
