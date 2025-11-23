import { IVerificationRepository } from "@core/interfaces/IVerificationRepository";
import { VerificationRequest } from "@core/domain/VerificationRequest";

export class InMemoryVerificationRepo implements IVerificationRepository {
  // mimic a database table in memory (ram)
  private db = new Map<string, VerificationRequest>();

  async save(request: VerificationRequest): Promise<void> {
    this.db.set(request.id, request);
    console.log(
      `[Database] Registro salvo: ${request.id} - Status: ${request.status}`
    );
  }

  async findById(id: string): Promise<VerificationRequest | null> {
    const item = this.db.get(id);
    return item ? VerificationRequest.restore(item) : null;
  }

  async update(request: VerificationRequest): Promise<void> {
    this.db.set(request.id, request);
  }
}
