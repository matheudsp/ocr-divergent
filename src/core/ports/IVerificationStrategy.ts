import { ExpectedData } from "../dtos/verification.dto";

export interface StrategyResult {
  score: number;
  reason?: string;
}

export interface IVerificationStrategy {
  calculateConfidence(
    extractedText: string,
    expectedData: ExpectedData
  ): StrategyResult;
}
