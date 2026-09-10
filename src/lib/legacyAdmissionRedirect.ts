/**
 * Converts the retired /admission/:jambName route into the unified discovery
 * route without discarding guidance context from an old bookmark.
 */
export function legacyAdmissionHref(
  base: string,
  jambName: string,
  params: Record<string, string | string[]>,
  admin = false,
): string {
  const query = new URLSearchParams();
  query.set("mode", "programme");
  query.set("q", safeDecode(jambName));
  if (admin) query.set("admin", "1");

  Object.entries(params).forEach(([key, value]) => {
    if (key === "jambName" || key === "mode" || key === "q") return;
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    } else {
      query.set(key, value);
    }
  });

  return `${base}/admission?${query.toString()}`;
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
