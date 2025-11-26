import {
  IVerificationStrategy,
  StrategyResult,
} from "../ports/IVerificationStrategy";
import { ExpectedData } from "../dtos/verification.dto";
import { TextHelper } from "../../shared/helpers/TextHelper";

export class IdentityVerificationStrategy implements IVerificationStrategy {
  constructor(private similarityThreshold: number) {}

  calculateConfidence(
    extractedText: string,
    expectedData: ExpectedData
  ): StrategyResult {
    const cleanText = TextHelper.normalize(extractedText);
    const cleanExpectedName = TextHelper.normalize(expectedData.name);

    const textDigits = TextHelper.extractNumbers(extractedText);
    const cpfDigits = TextHelper.extractNumbers(expectedData.cpf);
    const cpfFound = textDigits.includes(cpfDigits);

    if (!cpfFound) {
      return {
        score: 0,
        reason: "CPF não encontrado ou divergente no documento.",
      };
    }

    const nameSimilarity = TextHelper.calculateSimilarity(
      cleanExpectedName,
      cleanText
    );

    if (nameSimilarity < this.similarityThreshold) {
      return {
        score: 0,
        reason: `Nome divergente (Similaridade: ${(
          nameSimilarity * 100
        ).toFixed(1)}%). Esperado: ${expectedData.name}`,
      };
    }

    return {
      score: Math.round(nameSimilarity * 100),
    };
  }
}
