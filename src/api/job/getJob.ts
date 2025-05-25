import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";
import { Job } from "../_types/job";

export async function getJob(jobId: string): Promise<Job> {
  try {
    const response = await fetch(`${BASE_URL}/job/${jobId}`, {
        method: 'GET',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    return await checkResponseAndGetJson(response) as unknown as Job;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the job';
    throw Error(errorMessage);
  }
}