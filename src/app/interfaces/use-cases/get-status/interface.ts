import type { GetStatusOutputDto } from "./dto";

export interface GetStatus {
  execute(): Promise<GetStatusOutputDto>;
}
