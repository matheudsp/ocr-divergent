import { fileTypeFromBuffer } from "file-type";

export class FileValidator {
  private static readonly ALLOWED_MIMES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    // "application/pdf",
  ];

  static async validate(
    buffer: Buffer,
    originalMimeType: string
  ): Promise<void> {
    const type = await fileTypeFromBuffer(buffer);

    if (!type) {
      // Assinatura não identificada
      throw new Error("Arquivo inválido ou corrompido.");
    }

    if (!this.ALLOWED_MIMES.includes(type.mime)) {
      throw new Error(
        `Tipo de arquivo não permitido: ${type.mime}. Use JPG ou PNG`
      );
    }

    // "Mime Confusion Attacks"
    if (type.mime !== originalMimeType) {
      throw new Error(
        "Mime Type declarado difere do conteúdo real do arquivo."
      );
    }
  }
}
