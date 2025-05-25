import { ChatPageData } from "../_types/chatpagedata";
import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";


export async function getChatPages(): Promise<ChatPageData[]> {
  try {
    const response = await fetch(`${BASE_URL}/chat-pages`, {
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    const chatPagesObj = await checkResponseAndGetJson(response);
    return chatPagesObj["chat_pages"] as ChatPageData[];
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the chat pages';
    throw Error(errorMessage);
  }
}