import * as mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

// Configure pdfjs worker for Vite environment
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "4.10.38"}/pdf.worker.min.mjs`;
}

export interface ExtractedDocument {
  text: string;
  isImageOnlyOrScanned: boolean;
  pageCount: number;
  fileName: string;
  fileSize: number;
}

export async function extractTextFromFile(file: File): Promise<ExtractedDocument> {
  const fileName = file.name.toLowerCase();
  const fileSize = file.size;

  if (fileSize > 10 * 1024 * 1024) {
    throw new Error("File exceeds maximum allowed size of 10MB.");
  }

  // 1. Plain Text or Markdown
  if (fileName.endsWith(".txt") || fileName.endsWith(".md")) {
    const text = await file.text();
    return {
      text,
      isImageOnlyOrScanned: text.trim().length === 0,
      pageCount: 1,
      fileName: file.name,
      fileSize,
    };
  }

  // 2. Word Document (.docx)
  if (fileName.endsWith(".docx")) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value || "";
      return {
        text,
        isImageOnlyOrScanned: text.trim().length === 0,
        pageCount: 1,
        fileName: file.name,
        fileSize,
      };
    } catch (err: any) {
      console.error("DOCX parsing error:", err);
      throw new Error(`Failed to extract text from DOCX file: ${err.message || "Corrupted format"}`);
    }
  }

  // 3. PDF Document (.pdf)
  if (fileName.endsWith(".pdf")) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      let fullText = "";
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || "")
          .join(" ");
        fullText += pageText + "\n";
      }

      const trimmed = fullText.trim();
      const isScanned = trimmed.length < 50; // Less than 50 characters across all pages indicates scanned image PDF

      return {
        text: fullText,
        isImageOnlyOrScanned: isScanned,
        pageCount: numPages,
        fileName: file.name,
        fileSize,
      };
    } catch (err: any) {
      console.error("PDF parsing error:", err);
      // Fallback: If PDF parsing fails due to worker CORS, prompt graceful message
      throw new Error(`Could not parse PDF content: ${err.message || "File might be corrupted or protected"}`);
    }
  }

  throw new Error("Unsupported file format. Please upload a PDF, DOCX, or TXT file.");
}
