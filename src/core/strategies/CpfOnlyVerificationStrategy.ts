import {
  IVerificationStrategy,
  StrategyResult,
} from "../ports/IVerificationStrategy";
import { ExpectedData } from "../dtos/verification.dto";
import { TextHelper } from "../../shared/helpers/TextHelper";

export class CpfOnlyVerificationStrategy implements IVerificationStrategy {
  calculateConfidence(
    extractedText: string,
    expectedData: ExpectedData
  ): StrategyResult {
    const textDigits = TextHelper.extractNumbers(extractedText);
    const cpfDigits = TextHelper.extractNumbers(expectedData.cpf);

    const found = textDigits.includes(cpfDigits);

    if (!found) {
      return {
        score: 0,
        reason: `CPF informado (${expectedData.cpf}) não foi localizado no documento.`,
      };
    }

    return { score: 100 };
  }
}
