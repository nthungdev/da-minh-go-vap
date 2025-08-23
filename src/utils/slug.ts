export function validateSlug(slug: string | null | undefined) {
  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return "Invalid slug";
  }
  return true;
}
