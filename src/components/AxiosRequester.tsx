
import axios from 'axios';
import { AxiosError, type AxiosResponse } from 'axios';

const axiosRequester = (cfg: RequesterConfigInterface) => {
    const client = axios.create({
        'timeout': 5000
    });

    client.interceptors.request.use(
        (config) => {
            let headers: any = {};

            if (cfg.headers == null) {
                headers['Content-Type'] = 'application/json';
            }

            if (cfg.token != null) {
                headers['grooveToken'] = cfg.token;
            }

            if (cfg.useWhat == 'form') {
                headers['Content-Type'] = 'multipart/form-data';
            } else if (cfg.useWhat = 'json') {
                headers['Content-Type'] = 'application/json';
            }

            config.headers = headers;

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // 添加一个响应拦截器
    client.interceptors.response.use(
        (response: AxiosResponse) => {
            const { status, data } = response;

            if (status === 200) {
                return response;
            }

            return Promise.reject(response);
        },
        (error: AxiosError) => {
            const { response } = error;

            // 根据响应的错误状态码，做不同的处理，此处只是作为示例，请根据实际业务处理
            if (response) {
                if (response.status === 400) {
                    // Bad format request
                } else if (response.status === 401) {
                    // Unauthorized request
                } else {
                    // Unknown bad request
                }
            }

            return Promise.reject(error);
        }
    );

    return client;
}

export default axiosRequester;

type Headers = { [key: string]: string };

export interface RequesterConfigInterface {
    token: string | undefined;
    useWhat: string;
    headers: Headers;
    useForm(): void;
    useJson(): void;
    getHeaders(): Headers
}

class RequesterConfigImpl implements RequesterConfigInterface {
    token: string | undefined;
    useWhat: string = 'json';
    headers: Headers = {};

    constructor(token: string | undefined) {
        this.token = token;
    }

    useForm() {
        this.useWhat = 'form';
    }

    useJson() {
        this.useWhat = 'json';
    }

    getHeaders() {
        if (this.token != null) {
            this.headers.grooveToken = this.token;
        }

        if (this.useWhat == 'form') {
            this.headers['Content-Type'] = 'multipart/form-data';
        } else if (this.useWhat = 'json') {
            this.headers['Content-Type'] = 'application/json';
        }

        return this.headers;
    }

    setHeader(name: string, val: string) {
        this.headers[name] = val;
    }
}

export const requesterConfig = (t: string | undefined) => {
    return new RequesterConfigImpl(t);
};