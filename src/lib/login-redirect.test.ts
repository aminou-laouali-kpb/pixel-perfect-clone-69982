import { describe, expect, it } from "vitest";
import { parseLoginRedirect } from "./login-redirect";

describe("parseLoginRedirect", () => {
  it("keeps the path of a simple internal target", () => {
    expect(parseLoginRedirect("/contrat")).toEqual({ to: "/contrat", search: undefined });
  });

  it("splits the query string into search params", () => {
    expect(parseLoginRedirect("/contrat?utm=mail&page=2")).toEqual({
      to: "/contrat",
      search: { utm: "mail", page: "2" },
    });
  });

  it("drops the hash fragment", () => {
    expect(parseLoginRedirect("/dashboard#section")).toEqual({
      to: "/dashboard",
      search: undefined,
    });
  });

  it.each(["", undefined, null, "https://evil.example", "//evil.example", "dashboard"])(
    "rejects %p",
    (raw) => {
      expect(parseLoginRedirect(raw)).toBeNull();
    },
  );
});
