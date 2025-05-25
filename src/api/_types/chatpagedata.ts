import { ChatBoxStyle } from "./chatboxstyle";
import { ChatPageStyle } from "./chatpagestyle";

export interface ChatPageData {
    chat_page_id: string;
    org_id: string;
    agent_id: string;
    heading: string;
    description?: string;
    chat_page_style: ChatPageStyle;
    chat_box_style: ChatBoxStyle;
    buttons?: { label: string; link: string }[];
}