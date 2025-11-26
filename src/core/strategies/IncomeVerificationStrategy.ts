import {
  IVerificationStrategy,
  StrategyResult,
} from "../ports/IVerificationStrategy";
import { ExpectedData } from "../dtos/verification.dto";

export class IncomeVerificationStrategy implements IVerificationStrategy {
  calculateConfidence(
    extractedText: string,
    expectedData: ExpectedData
  ): StrategyResult {
    if (!expectedData.declaredIncome) {
      return {
        score: 0,
        reason:
          "Renda declarada não foi fornecida nos metadados para comparação.",
      };
    }

    const moneyMatches = extractedText.match(/[\d\.]+,?\d{0,2}/g);

    if (!moneyMatches || moneyMatches.length === 0) {
      return {
        score: 0,
        reason: "Nenhum valor monetário legível foi identificado no documento.",
      };
    }

    const targetIncome = expectedData.declaredIncome;
    const tolerance = 0.2; // 20%

    const compatibleValue = moneyMatches.find((valStr) => {
      const normalized = valStr.replace(/\./g, "").replace(",", ".");
      const value = parseFloat(normalized);

      if (isNaN(value)) return false;

      const diff = Math.abs(value - targetIncome);
      return diff / targetIncome <= tolerance;
    });

    if (!compatibleValue) {
      const foundValues = moneyMatches.slice(0, 3).join(", ");
      return {
        score: 0,
        reason: `Renda declarada (${targetIncome}) incompatível com os valores extraídos do documento. Margem de erro aceita: ${
          tolerance * 100
        }%.`,
      };
    }

    return { score: 100 };
  }
}
