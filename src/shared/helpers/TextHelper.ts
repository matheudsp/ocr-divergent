import levenshtein from "fast-levenshtein";

export class TextHelper {
  /**
   * Remove acentos, transforma em uppercase e remove espaços extras.
   */
  static normalize(text: string): string {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();
  }

  /**
   * Calcula a similaridade entre uma string agulha (needle) e um palheiro (haystack).
   * Usa janela deslizante para encontrar a melhor correspondência dentro do texto completo.
   */
  static calculateSimilarity(needle: string, haystack: string): number {
    if (!needle || !haystack) return 0;
    if (haystack.includes(needle)) return 1.0;

    const words = haystack.split(/\s+/);
    let bestDist = Infinity;
    const needleParts = needle.split(" ").length;

    // Janela deslizante para comparar trechos de tamanho similar
    for (let i = 0; i <= words.length - needleParts; i++) {
      const chunk = words.slice(i, i + needleParts).join(" ");
      const dist = levenshtein.get(needle, chunk);
      if (dist < bestDist) bestDist = dist;
    }

    const maxLength = Math.max(needle.length, 1);
    const similarity = 1 - bestDist / maxLength;

    return Math.max(0, similarity);
  }

  static extractNumbers(text: string): string {
    return text.replace(/\D/g, "");
  }
}
