import { describe, expect, it } from "vitest";
import { normalizeRegistrationId } from "./registrationId";

describe("normalizeRegistrationId", () => {
  const uid = "q8uxtuQAjNUOzXGYM2uJ9iXYW6P2";

  it("mantém matrícula SE + 5 dígitos", () => {
    expect(normalizeRegistrationId("SE12345", uid)).toBe("SE12345");
    expect(normalizeRegistrationId("se00001", uid)).toBe("SE00001");
  });

  it("deriva SE***** estável a partir do UID e formatos legados", () => {
    const fromUid = normalizeRegistrationId(null, uid);

    expect(fromUid).toMatch(/^SE\d{5}$/);
    expect(normalizeRegistrationId(uid, uid)).toBe(fromUid);
    expect(normalizeRegistrationId("-", uid)).toBe(fromUid);
    expect(normalizeRegistrationId("SE999", uid)).toBe(fromUid);
    expect(normalizeRegistrationId(null, uid)).toBe(fromUid);
    expect(normalizeRegistrationId(null, "outro-uid")).not.toBe(fromUid);
  });
});
