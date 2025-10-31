import axios from 'axios';

export async function FetchPreloadPkId(session: string, viewId: string, pkId: string): Promise<any> {
    const VITE_JET_ASP_BPC_API = import.meta.env.VITE_JET_ASP_BPC_API;

    const api = axios.create({
        baseURL: VITE_JET_ASP_BPC_API + '/tableview/preloadpkid',
        timeout: 5000,
    });

    api.interceptors.response.use(
        (response) => {
            // Status codes in the 2xx range will trigger this function
            return response;
        },
        (error) => {
            // Reject promise and pass the error to the subsequent catch block
            return Promise.reject(error);
        }
    );

    try {
        const response = await api.post(VITE_JET_ASP_BPC_API + '/tableview/preloadpkid', {
            'viewId': viewId,
            'pkId': pkId
        }, {
            headers: {
                'Content-Type': 'application/json',
                'grooveToken': session
            }
        });

        return response.data.data;
    } catch (error) {
        throw error;
    }
}