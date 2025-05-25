import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";
import { ChatPageData } from "../_types/chatpagedata";


export async function updateChatPage(chatPage: ChatPageData): Promise<ChatPageData> {
  try {
    const response = await fetch(`${BASE_URL}/chat-page/${chatPage.chat_page_id}`, {
        method: 'POST',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(chatPage),
    });
    return await checkResponseAndGetJson(response) as unknown as ChatPageData;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred updating the chat page';
    throw Error(errorMessage);
  }
}