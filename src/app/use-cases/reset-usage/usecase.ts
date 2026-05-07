import type { UsageAccounting } from "@/app/interfaces/services/usage-accounting/interface";
import type { UsageStateRepository } from "@/app/interfaces/storage/usage-state/interface";
import { ResetUsageError } from "@/app/interfaces/use-cases/reset-usage/error";
import type { ResetUsage } from "@/app/interfaces/use-cases/reset-usage/interface";

export class ResetUsageUseCase implements ResetUsage {
  constructor(
    private readonly usageStateRepository: UsageStateRepository,
    private readonly usageAccounting: UsageAccounting,
  ) {}

  async execute(): Promise<void> {
    try {
      await this.usageStateRepository.save(this.usageAccounting.createResetState());
    } catch (error) {
      throw new ResetUsageError(error);
    }
  }
}
