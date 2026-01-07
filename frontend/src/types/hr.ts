// hr.ts
import { type HRItem } from "./employee";

export interface HRMetricsData {
    employees: HRItem[];
    trainings: HRItem[];
    departments: HRItem[];
}
