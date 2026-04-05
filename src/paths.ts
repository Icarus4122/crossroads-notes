/**
 * Path normalization, absolute/relative detection, repo-root resolution — §11.
 */

/** Normalize a path to forward slashes and strip trailing slash. */
export function normalizePath(p: string): string {
  let result = p.replace(/\\/g, "/");
  if (result.length > 1 && result.endsWith("/")) {
    result = result.slice(0, -1);
  }
  return result;
}

/** Test whether a stored path is absolute (Unix / or Windows drive letter). */
export function isAbsolutePath(p: string): boolean {
  if (p.startsWith("/")) return true;
  if (/^[A-Za-z]:\//.test(p)) return true;
  return false;
}

/**
 * Determine the stored form for a source file path.
 *
 * If the normalized absolute path starts with a configured repo root,
 * returns the repo-relative portion. Otherwise returns the absolute path.
 *
 * @param absolutePath - The full absolute path to the source file.
 * @param repoRoots - Array of configured repo root paths (may be empty strings = unconfigured).
 */
export function toStoredPath(absolutePath: string, repoRoots: string[]): string {
  const norm = normalizePath(absolutePath);
  for (const root of repoRoots) {
    if (!root) continue;
    const normRoot = normalizePath(root);
    const prefix = normRoot.endsWith("/") ? normRoot : normRoot + "/";
    if (norm.startsWith(prefix)) {
      return norm.slice(prefix.length);
    }
  }
  return norm;
}

/**
 * Resolve a stored path back to an absolute path on disk.
 *
 * If the stored path is already absolute, return it.
 * If relative, join with the provided repo root.
 * Returns null if the path is relative and no repo root is given.
 */
export function resolveStoredPath(storedPath: string, repoRoot: string | null): string | null {
  if (isAbsolutePath(storedPath)) return storedPath;
  if (!repoRoot) return null;
  const normRoot = normalizePath(repoRoot);
  return normRoot + "/" + storedPath;
}

/** Convert a forward-slash path to the platform native separator. */
export function toPlatformPath(p: string): string {
  if (process.platform === "win32") {
    return p.replace(/\//g, "\\");
  }
  return p;
}

/** Get the parent directory of a forward-slash path. */
export function parentDir(p: string): string {
  const norm = normalizePath(p);
  const lastSlash = norm.lastIndexOf("/");
  if (lastSlash <= 0) return norm;
  return norm.substring(0, lastSlash);
}
