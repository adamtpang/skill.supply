import { assertCompanyShots } from "../../lib/shots";
import { spacex } from "./spacex";
import type { CompanyShots } from "./types";

export const SHOTS: readonly CompanyShots[] = [spacex];

assertCompanyShots(SHOTS);

export function getShots(slug: string): CompanyShots | undefined {
  return SHOTS.find((company) => company.slug === slug);
}

export type { CompanyShots, Observation } from "./types";
