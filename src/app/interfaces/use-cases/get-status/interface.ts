import type { GetStatusResultDto } from "./dto";

export interface GetStatus {
  execute(): Promise<GetStatusResultDto>;
}
