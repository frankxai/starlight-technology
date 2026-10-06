export function isPrivateStudioPath(pathname: string): boolean {
  try {
    const path = decodeURIComponent(pathname);
    return path === "/studio" || path.startsWith("/studio/");
  } catch {
    return true;
  }
}

export function filterPublicTelemetry<T extends { url: string }>(event: T, currentPath: string): T | null {
  try {
    const url = new URL(event.url);
    if (!/^https?:$/.test(url.protocol) || isPrivateStudioPath(url.pathname) || isPrivateStudioPath(currentPath)) return null;
    return { ...event, url: `${url.origin}${url.pathname}` };
  } catch {
    return null;
  }
}
