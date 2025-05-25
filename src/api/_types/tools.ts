import { Parameter } from "./parameterdefinition";

export interface Tool {
    tool_id: string;
    org_id: string;
    name: string;
    description?: string;
    pd_id?: string;
    code?: string;
}

export interface TestInput {
    name: string;
    type: "string" | "number" | "boolean" | "object" | "array" | "enum";
    value: string | number | boolean | TestInput[];
    options?: string[];
    arrayTypeParameter?: Parameter;
}

export type AnyType = string | number | boolean | { [key: string]: AnyType } | AnyType[];