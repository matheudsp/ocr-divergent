import { DocumentType } from "../dtos/verification.dto";
import { IVerificationStrategy } from "../ports/IVerificationStrategy";
import { IdentityVerificationStrategy } from "../strategies/IdentityVerificationStrategy";
import { IncomeVerificationStrategy } from "../strategies/IncomeVerificationStrategy";
import { CpfOnlyVerificationStrategy } from "../strategies/CpfOnlyVerificationStrategy";

export class VerificationStrategyFactory {
  static create(type: DocumentType, threshold: number): IVerificationStrategy {
    switch (type) {
      case DocumentType.RG:
      case DocumentType.CNH:
        return new IdentityVerificationStrategy(threshold);

      case DocumentType.COMPROVANTE_RENDA:
        return new IncomeVerificationStrategy();

      case DocumentType.CPF:
        return new CpfOnlyVerificationStrategy();

      default:
        throw new Error(`Estratégia de verificação não definida para: ${type}`);
    }
  }
}
