/* eslint-disable */
export type Message =
  | {
      sender: "ai" | "human";
      message: string;
    }
  | {
      type: "tool_call";
      tool_call_id: string;
      tool_name: string;
      tool_input: Record<string, any>;
    }
  | {
      type: "tool_response";
      tool_call_id: string;
      tool_output: string;
    };

export interface Context {
    context_id: string;
    agent_id: string;
    messages: Message[];
}