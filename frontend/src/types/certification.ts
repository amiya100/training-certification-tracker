// certification.ts
export interface Certification {
    id: number;
    employee_id: number;
    training_id: number;
    cert_number: string;
    issue_date: string;
    expiry_date: string;
    status: string;
    created_at: string;
    updated_at: string;
}
