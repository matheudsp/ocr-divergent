import Tesseract from "tesseract.js";
import { IOcrProvider } from "@core/interfaces/IOcrProvider";

export class TesseractOcrProvider implements IOcrProvider {
  async extractText(imageBuffer: Buffer): Promise<string> {
    try {
      const result = await Tesseract.recognize(imageBuffer, "por", {
        // enable only in dev
        // logger: (m) => console.log(m),
      });

      return result.data.text;
    } catch (error) {
      console.error("Erro no OCR:", error);
      throw new Error("Falha ao processar imagem via OCR");
    }
  }
}
