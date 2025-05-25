export interface ContextHistoryAgent {
    agent_id: string;
    agent_name: string;
    agent_description: string;
}

export interface ContextHistory {
    context_id: string;
    user_id: string;
    last_message: string;
    created_at: number;
    updated_at: number;
    agent: ContextHistoryAgent;
}