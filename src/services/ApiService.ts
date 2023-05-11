import axios from "axios";

const PublicApi: any = axios.create({
    baseURL: process.env.apiUrl,
    headers: {
        'Content-Type': "application/json",
        'Accept': "application/json",
    }
});

const PrivateApi: any = axios.create({
    baseURL: process.env.apiUrl,
    headers: {
        'Content-Type': "application/json",
        'Accept': "application/json",
    }
});

PrivateApi.interceptors.request.use(
    (config: any) => {
        if(typeof window !== "undefined"){
            const token = localStorage.getItem("access_token");
            if(token){
                config.headers = {
                    ...config.headers,
                    'Authorization': `Bearer ${token}`
                };
            }
        }
        return config;
    }
);

PrivateApi.interceptors.response.use(
    (response: any) => {
        return response
    },
    async (error: any) => {
        const originalRequest = error.config;
        let token = localStorage.getItem("access_token");
        console.log(error);
        if(error.response.status == 401 && !originalRequest._retry && token){
            originalRequest._retry = true;
            
            let newToken: any = await refreshToken();

            if(newToken.access_token){
                localStorage.setItem("access_token", newToken.access_token);
                originalRequest.headers = {
                    ...originalRequest.headers,
                    'Authorization': `Bearer ${newToken.access_token}`
                };
            }

            return axios(originalRequest);
        }

        return Promise.reject(error);
    }
);

async function refreshToken(error: any = null)
{
    let token = localStorage.getItem("access_token");
    let headers = {
        'Content-Type': "application/json",
        'Accept': "application/json",
        'Authorization': `Bearer ${token}`
    };

    var newToken = null;

    await PublicApi.post("/auth/refresh", {}, { headers }).then((res: any) => {
        let data = res.data;
        if(data.access_token){
            newToken = data;
        }
    });

    return newToken;
}

export {
    PublicApi,
    PrivateApi
};
