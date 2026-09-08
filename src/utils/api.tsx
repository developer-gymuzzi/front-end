import axios from "axios";

export const google_login = () => {

};

const Api_Base_url = import.meta.env.VITE_API_LIVEHOST;
const Api_x_header_key = import.meta.env.VITE_API_KEY;
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_LIVEHOST,
    headers: {
        "x-api-key": import.meta.env.VITE_API_X_HEADER_KEY,
        "Content-Type": "application/json",
    },
});

export const api_calling = async (endpoint: string, body: any, customHeaders: Record<string, any> = {}) => {
    try {
        const response = await apiClient.post(endpoint, body, {
            headers: customHeaders,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};


// export const two_factor = async (endpoint: string, body: any, customHeaders: Record<string, any> = {}) => {
//     try {
//         const response = await apiClient.post(endpoint, body, {
//             headers: customHeaders,
//         });
//         return response.data;
//     } catch (error) {
//         throw error;
//     }
// };
//this is the change

