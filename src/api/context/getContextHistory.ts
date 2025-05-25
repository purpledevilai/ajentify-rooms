import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";
import { ContextHistory } from "../_types/contexthistory";


export async function getContextHistory(): Promise<ContextHistory[]> {
  try {
    const response = await fetch(`${BASE_URL}/context-history`, {
        method: 'GET',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    const contextHistoryObj = await checkResponseAndGetJson(response);
    return contextHistoryObj["contexts"] as ContextHistory[];
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the context history';
    throw Error(errorMessage);
  }
}