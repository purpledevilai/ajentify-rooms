import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";
import { Context } from "../_types/context";

export interface GetContextPayload {
    context_id: string;
    with_tool_calls?: boolean;
}

export async function getContext({context_id, with_tool_calls}: GetContextPayload): Promise<Context> {
  try {
    let queryParams = '';
    if (with_tool_calls) {
      queryParams += `?with_tool_calls=true`;
    }
    const response = await fetch(`${BASE_URL}/context/${context_id}${queryParams}`, {
        method: 'GET',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    return await checkResponseAndGetJson(response) as unknown as Context;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred creating the context';
    throw Error(errorMessage);
  }
}