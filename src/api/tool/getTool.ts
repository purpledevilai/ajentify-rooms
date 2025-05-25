import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";
import { Tool } from "../_types/tools";

export async function getTool(toolId: string): Promise<Tool> {
  try {
    const response = await fetch(`${BASE_URL}/tool/${toolId}`, {
        method: 'GET'
    });
    return await checkResponseAndGetJson(response) as unknown as Tool;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting tool data';
    throw Error(errorMessage);
  }
}