import {StorageProvider} from "../interaces/StorageProvider";
import {RedisSettings} from "../interaces/RedisSettings";
import { RedisClient } from 'redis';

const redis = require("redis");
const {promisify} = require("util");


export class RedisProvider implements StorageProvider {

    _client: RedisClient;

    constructor(settings: RedisSettings) {
        this._client = redis.createClient(settings);
        this._client.on("error", function (error: any) {
            console.error("Redis failed to connect");
            console.error(error);
        });

        this._client.on("ready", function (error: any) {
            console.log("Redis is connected and ready");
        });

        this._client.on("reconnecting", function (error: any) {
            console.log("Redis is attempting to reconnect");
        });
    }

    isReady() {
        const promiseWithTimeout = (timeoutMs: number, promise: () => Promise<any>) => {
            return Promise.race([
                promise(),
                new Promise((resolve) => setTimeout(() => {
                    this._client.end(true);
                    resolve(false)
                }, timeoutMs)),
            ]);
        };
        return promiseWithTimeout(5000, () => {
            return new Promise(resolve => {
                this._client.once('ready', () => resolve(true));
            });
        });
    }


    get(key: string): Promise<any> {
        return promisify(this._client.get(key)).bind(this._client);
    }

    store(key: string, value: any): Promise<any> {
        return promisify(this._client.set(key, value)).bind(this._client)
    }

}
