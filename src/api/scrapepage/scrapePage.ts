import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";
import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";


export async function scrapePage(link: string): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/scrape-page/${link}`, {
        method: 'GET',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    const resJson = await checkResponseAndGetJson(response) as { page_content: string };
    return resJson.page_content;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred scraping the page';
    throw Error(errorMessage);
  }
}