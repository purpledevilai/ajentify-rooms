export interface StructuredResponseEndpoint {
    sre_id: string;
    org_id: string;
    name: string;
    description?: string;
    pd_id: string;
    is_public: boolean;
    created_at: number;
    updated_at: number;
}
