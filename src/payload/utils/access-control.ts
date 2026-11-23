import type {
  AccessArgs,
  AccessResult,
  CollectionBeforeChangeHook,
  PayloadRequest,
} from "payload";
import type { Post, User } from "@/payload-types";

export function onlyRoles(
  allowedRoles: User["role"][],
): (args: { req: PayloadRequest }) => boolean {
  return ({ req }: { req: PayloadRequest }): boolean => {
    if (!req.user) return false;
    if (allowedRoles.includes(req.user.role)) return true;
    return false;
  };
}

export function onlySelfAndRoles(
  allowedRoles: User["role"][],
): (args: { req: PayloadRequest; id?: string | number }) => boolean {
  return ({ req, id }: { req: PayloadRequest; id?: string | number }) => {
    if (!req.user) return false;
    if (allowedRoles.includes(req.user.role)) return true;
    // Allow users to update their own data
    if (req.user.id === id) return true;
    return false;
  };
}

export function postsReadAccess({ req }: AccessArgs<Post>): AccessResult {
  function isCmsPath(pathname: string) {
    return pathname.startsWith("/admin");
  }

  // Allow access to all posts in the admin panel
  if (isCmsPath(req.pathname) && req.user) return true;

  // For public (unauthenticated) access
  return {
    publishedAt: { less_than_equal: new Date().toISOString() },
    and: [
      // title and body can be undefined for unedited locales
      { title: { exists: true } },
      {
        // Content must exist for the post's content mode. `blockType` is
        // queried instead of the array itself so empty arrays don't match.
        or: [
          { contentMode: { exists: false }, body: { exists: true } },
          { contentMode: { equals: "markdown" }, body: { exists: true } },
          {
            contentMode: { equals: "template" },
            "template.blockType": { exists: true },
          },
          {
            contentMode: { equals: "blocks" },
            "contentBlocks.blockType": { exists: true },
          },
        ],
      },
    ],
  };
}

/**
 * Grants post deletion to admins and managers for all posts,
 * and restricts authors to deleting only posts they created.
 */
export function postsDeleteAccess({ req }: AccessArgs<Post>): AccessResult {
  if (!req.user) return false;
  if (req.user.role === "admin" || req.user.role === "manager") return true;
  if (req.user.role === "author") {
    return {
      createdBy: {
        equals: req.user.id,
      },
    };
  }
  return false;
}

/**
 * Stamps `createdBy` with the authenticated user on document creation.
 * Admins may explicitly assign `createdBy` on create; other roles always default to themselves.
 */
export const stampCreatedBy: CollectionBeforeChangeHook = ({
  data,
  operation,
  req,
}) => {
  if (operation !== "create" || !req.user) {
    return data;
  }
  if (req.user.role === "admin" && data?.createdBy) {
    return data;
  }
  return {
    ...data,
    createdBy: req.user.id,
  };
};
