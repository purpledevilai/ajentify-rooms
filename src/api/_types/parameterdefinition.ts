export interface Parameter {
    name: string;
    description: string;
    type: "string" | "number" | "boolean" | "object" | "array" | "enum";
    parameters: Parameter[];
}

export interface ParameterDefinition {
    pd_id: string;
    org_id: string;
    parameters: Parameter[];
    created_at: number;
    updated_at: number;
}