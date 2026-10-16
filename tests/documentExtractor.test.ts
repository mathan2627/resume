import { describe, it, expect } from "vitest";
import { extractTextFromFile } from "../src/lib/documentExtractor";

describe("Resume Document Extraction Engine", () => {
  it("rejects files that exceed the 10MB safety limit", async () => {
    // Create a mock large file
    const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], "oversized_resume.pdf", {
      type: "application/pdf",
    });

    await expect(extractTextFromFile(largeFile)).rejects.toThrow(
      "File exceeds maximum allowed size of 10MB."
    );
  });

  it("extracts text and flags scanned/empty files correctly for text documents", async () => {
    const validResumeContent = `
      Jane Doe
      jane@example.com
      Skills: React, TypeScript, Node.js, PostgreSQL
      Experience: Full Stack Intern at Tech Corp
    `;
    const textFile = new File([validResumeContent], "jane_resume.txt", { type: "text/plain" });

    const result = await extractTextFromFile(textFile);
    expect(result.text).toContain("jane@example.com");
    expect(result.text).toContain("TypeScript");
    expect(result.isImageOnlyOrScanned).toBe(false);
    expect(result.pageCount).toBe(1);
    expect(result.fileName).toBe("jane_resume.txt");
  });

  it("flags empty text files as scanned or empty", async () => {
    const emptyFile = new File(["   "], "blank.txt", { type: "text/plain" });
    const result = await extractTextFromFile(emptyFile);
    expect(result.isImageOnlyOrScanned).toBe(true);
  });

  it("rejects unsupported binary formats like .exe or .zip", async () => {
    const invalidFile = new File(["fake binary data"], "resume.exe", {
      type: "application/octet-stream",
    });

    await expect(extractTextFromFile(invalidFile)).rejects.toThrow(
      "Unsupported file format"
    );
  });
});
