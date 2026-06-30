const YOUTUBE_HOSTS = ["youtube.com", "www.youtube.com", "youtu.be", "m.youtube.com"] as const;

/**
 * Extrai o ID de um vídeo do YouTube a partir de URLs comuns (watch, embed, youtu.be).
 */
export function extractYouTubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id || null;
    }

    if (!YOUTUBE_HOSTS.some((knownHost) => knownHost.replace(/^www\./, "") === host)) {
      return null;
    }

    const fromQuery = parsed.searchParams.get("v");
    if (fromQuery) {
      return fromQuery;
    }

    const embedMatch = /^\/embed\/([^/?]+)/.exec(parsed.pathname);
    if (embedMatch?.[1]) {
      return embedMatch[1];
    }

    const shortsMatch = /^\/shorts\/([^/?]+)/.exec(parsed.pathname);
    if (shortsMatch?.[1]) {
      return shortsMatch[1];
    }

    return null;
  } catch {
    return null;
  }
}

export function buildYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}
