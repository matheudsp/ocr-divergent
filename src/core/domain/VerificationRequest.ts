import { randomUUID } from "crypto";
import {
  DocumentType,
  ExpectedData,
  VerificationResult,
  VerificationStatus,
} from "../dtos/verification.dto";

export interface VerificationRequestProps {
  id: string;
  externalReference?: string;
  documentType: DocumentType;
  fileKey: string;
  expectedData: ExpectedData;
  status: VerificationStatus;
  result?: VerificationResult;
  createdAt: Date;
  updatedAt: Date;
}

export class VerificationRequest {
  public readonly id: string;
  public readonly externalReference?: string;
  public readonly documentType: DocumentType;
  public readonly fileKey: string;
  public readonly expectedData: ExpectedData;
  public status: VerificationStatus;
  public result?: VerificationResult;
  public createdAt: Date;
  public updatedAt: Date;

  private constructor(props: VerificationRequestProps) {
    this.id = props.id;
    this.externalReference = props.externalReference;
    this.documentType = props.documentType;
    this.fileKey = props.fileKey;
    this.expectedData = props.expectedData;
    this.status = props.status;
    this.result = props.result;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    externalReference: string,
    documentType: DocumentType,
    fileKey: string,
    expectedData: ExpectedData
  ): VerificationRequest {
    return new VerificationRequest({
      id: randomUUID(),
      externalReference,
      documentType,
      fileKey,
      expectedData,
      status: VerificationStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: VerificationRequestProps): VerificationRequest {
    return new VerificationRequest(props);
  }

  markAsProcessing(): void {
    if (this.status !== VerificationStatus.PENDING) {
      throw new Error("Documento já está sendo processado ou finalizado.");
    }
    this.status = VerificationStatus.PROCESSING;
    this.updatedAt = new Date();
  }

  complete(result: VerificationResult): void {
    this.result = result;
    this.status = VerificationStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  fail(): void {
    this.status = VerificationStatus.FAILED;
    this.updatedAt = new Date();
  }
}
