import { describe, expect, it } from "vitest";
import {
  fileNameFromCommonsUrl,
  htmlToText,
  isPublicDomain,
} from "./wikimedia";

describe("fileNameFromCommonsUrl", () => {
  it("decodes the file name of a Special:FilePath URL", () => {
    expect(
      fileNameFromCommonsUrl(
        "http://commons.wikimedia.org/wiki/Special:FilePath/Rodez%20cath%C3%A9drale_nord.jpg",
      ),
    ).toBe("Rodez cathédrale nord.jpg");
  });
});

describe("htmlToText", () => {
  it("keeps the text of a credit link", () => {
    expect(
      htmlToText(
        '<a href="//commons.wikimedia.org/wiki/User:X">Jean &amp; Marie</a>',
      ),
    ).toBe("Jean & Marie");
  });

  it("collapses whitespace left by tags", () => {
    expect(htmlToText("<span>Photo</span>\n<span>by Paul</span>")).toBe(
      "Photo by Paul",
    );
  });

  it("drops the space a tag leaves before a period", () => {
    expect(htmlToText('uploaded at <a href="x">French Wikipedia</a>.')).toBe(
      "uploaded at French Wikipedia.",
    );
  });
});

describe("isPublicDomain", () => {
  it.each(["Public domain", "PD-old-70", "CC0"])("accepts %s", (license) => {
    expect(isPublicDomain(license)).toBe(true);
  });

  it.each(["CC BY-SA 4.0", "CC BY 2.0", "GFDL"])("rejects %s", (license) => {
    expect(isPublicDomain(license)).toBe(false);
  });
});
