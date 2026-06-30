import { describe, expect, it } from "vitest";
import { buildYouTubeEmbedUrl, extractYouTubeVideoId } from "./youtube";

describe("extractYouTubeVideoId", () => {
  it("extrai ID de URL watch padrão", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=qzgmDZphKVE")).toBe(
      "qzgmDZphKVE",
    );
  });

  it("extrai ID de URL youtu.be", () => {
    expect(extractYouTubeVideoId("https://youtu.be/qzgmDZphKVE")).toBe("qzgmDZphKVE");
  });

  it("extrai ID de URL embed", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/embed/qzgmDZphKVE")).toBe("qzgmDZphKVE");
  });

  it("retorna null para URL vazia ou inválida", () => {
    expect(extractYouTubeVideoId("")).toBeNull();
    expect(extractYouTubeVideoId("https://example.com/video")).toBeNull();
    expect(extractYouTubeVideoId("not-a-url")).toBeNull();
  });
});

describe("buildYouTubeEmbedUrl", () => {
  it("monta URL de embed com domínio nocookie", () => {
    expect(buildYouTubeEmbedUrl("qzgmDZphKVE")).toBe(
      "https://www.youtube-nocookie.com/embed/qzgmDZphKVE",
    );
  });
});
