import { IAuthRepository } from "../ports/IAuthRepository";

export class ValidateApiKeyUsecase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(key: string, requestIp?: string): Promise<boolean> {
    if (!key) return false;

    const apiKey = await this.authRepo.findByKey(key);

    if (!apiKey) return false;
    if (!apiKey.isActive) return false;

    if (apiKey.allowedIp) {
      if (!requestIp || apiKey.allowedIp !== requestIp) {
        return false;
      }
    }

    return true;
  }
}
