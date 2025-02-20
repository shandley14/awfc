import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL // ✅ Uses environment variable for API URL
})

export const dbApi = axios.create({
    baseURL: 'http://localhost:5173/api'
})

export const footHeaders = {
    'X-RapidAPI-Key': process.env.NEXT_PUBLIC_API_KEY, // ✅ Uses environment variable for API key
    'X-RapidAPI-Host': 'v3.football.api-sports.io' // ✅ Updated to match the correct API host
}

export const getApi = async (path: string, _options?: any) => {
    try {
        const res = await api.get(`/${path}`, _options);
        const data = await res.data;
        return data;
    } catch (error: any) {
        console.log(error);
        return {error: error, message: error?.message};
    }
}

export const postApi = async (path: string, body: any, _options?: any) => {
    try {
        const res = await dbApi.post(`/${path}`, body, _options);
        const data = await res.data;
        return data;
    } catch (error: any) {
        console.log(error);
        return {error: error, message: error?.message};
    }
}
