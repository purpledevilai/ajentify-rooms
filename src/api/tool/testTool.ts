import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";
import { AnyType } from "../_types/tools";


export interface TestToolPayload {
    function_name: string;
    params: Record<string, AnyType>;
    code: string;
}

export async function testTool(payload: TestToolPayload): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/test-tool`, {
        method: 'POST',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    return (await checkResponseAndGetJson(response) as {result: string}).result;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred creating the team';
    throw Error(errorMessage);
  }
}