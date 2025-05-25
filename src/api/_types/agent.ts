export interface Agent {
    agent_id: string;
    agent_name: string;
    agent_description: string;
    is_public: boolean;
    agent_speaks_first: boolean;
    uses_prompt_args?: boolean;
    prompt: string;
    tools?:  string[];
}