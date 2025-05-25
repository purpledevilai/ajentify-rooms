export interface ChatEvent {
    type: string;
    data: string;
}

export interface ChatResponse {
    response: string;
    events?: ChatEvent[];
}