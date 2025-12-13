import { Post, User } from "@/payload-types";
import { AccessArgs, AccessResult, PayloadRequest } from "payload";

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
      {
        // title and body can be undefined for unedited locales
        title: { exists: true },
        body: { exists: true },
      },
    ],
  };
}
