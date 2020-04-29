import {LocalSettings} from './interaces/LocalSettings';
import {RedisSettings} from './interaces/RedisSettings';
import {MemcachedSettings} from './interaces/MemcachedSettings';
import {RedisProvider} from './providers/redis';
import {Localprovider} from './providers/local';
import {MemcachedProvider} from './providers/memcached';
import {StorageProvider} from './interaces/StorageProvider';
import {NextFunction, Request, Response} from 'express';
import {isNil} from 'lodash';
import ConduitGrpcSdk from '@conduit/grpc-sdk';
import InMemoryStoreConfigSchema from './config/in-memory-store';
import {InMemoryStoreService} from "@conduit/protos/dist/src/in-memory-store_grpc_pb";
import * as grpc from "grpc";
import {GetResponse, StoreResponse} from "@conduit/protos/dist/src/in-memory-store_pb";

export class InMemoryStore {

    private _provider: StorageProvider | null = null;
    private isRunning: boolean = false;

    constructor(private readonly conduit: ConduitGrpcSdk) {
        var server = new grpc.Server();
        server.addService(InMemoryStoreService, {
            get: this.get,
            store: this.store
        });
        server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
        server.start();
        this.enableModule().catch(console.log);

    }

    private _get(key: string): Promise<any> {
        return this._provider!.get(key);
    }

    private _store(key: string, value: any): Promise<any> {
        return this._provider!.store(key, value)
    }

    get(call: any, callback: any) {
        this._get(call.request.key)
            .then(r => {
                let response = new GetResponse()
                response.setData(r.toString());
                callback(null, response);
            })
            .catch(err => {
                callback(err);
            })

    }

    store(call: any, callback: any) {
        this._store(call.request.key, call.request.value)
            .then(r => {
                let response = new StoreResponse()
                response.setResult(true);
                callback(null, response);
            })
            .catch(err => {
                callback(err, null);
            });
    }

    async setConfig(newConfig: any) {
        // this was wrong either way
        // if (!ConduitSDK.validateConfig(newConfig, InMemoryStoreConfigSchema.inMemoryStore)) {
        //     throw new Error('Invalid configuration values');
        // }

        let errorMessage: string | null = null;
        const updateResult = await this.conduit.config.updateConfig(newConfig, 'inMemoryStore').catch((e: Error) => errorMessage = e.message);
        if (!isNil(errorMessage)) {
            throw new Error(errorMessage);
        }

        if ((this.conduit as any).config.get('inMemoryStore.active')) {
            await this.enableModule().catch((e: Error) => errorMessage = e.message);
        } else {
            throw new Error('Module is not active');
        }
        if (!isNil(errorMessage)) {
            throw new Error(errorMessage);
        }

        return updateResult;
    }

    private async enableModule() {
        if (!this.isRunning) {
            await this.initProvider();
            const admin = this.conduit.admin;
            // admin.registerRoute('POST', '/in-memory-store',
            //     (req: Request, res: Response, next: NextFunction) => this.adminStore(req, res, next).catch(next));
            // admin.registerRoute('GET', '/in-memory-store/:key',
            //     (req: Request, res: Response, next: NextFunction) => this.adminGetByKey(req, res, next).catch(next));
            this.isRunning = true;
        } else {
            await this.initProvider();
        }
    }

    static get config() {
        return InMemoryStoreConfigSchema;
    }


    private async initProvider() {
        const name = (this.conduit as any).config.get('inMemoryStore.providerName');
        const storageSettings: LocalSettings | RedisSettings | MemcachedSettings = (this.conduit as any).config.get(`inMemoryStore.settings.${name}`);
        if (name === 'redis') {
            this._provider = new RedisProvider(storageSettings as RedisSettings);
            const isReady = await (this._provider as RedisProvider).isReady();
            if (!isReady) throw new Error('Redis failed to connect');
        } else if (name === 'memcache') {
            this._provider = new MemcachedProvider(storageSettings as MemcachedSettings);
        } else {
            this._provider = new Localprovider(storageSettings as LocalSettings);
        }
    }

    private async adminStore(req: Request, res: Response, next: NextFunction) {
        const {key, value} = req.body;
        if (isNil(key) || isNil(value)) {
            return res.status(401).json({error: 'Required fields are missing'});
        }

        const stored = await this._store(key, value);
        return res.json({stored});
    }

    private async adminGetByKey(req: Request, res: Response, next: NextFunction) {
        const key = req.params.key;
        if (isNil(key)) {
            return res.status(401).json({error: 'Required parameter "key" is missing'});
        }

        const stored = await this._get(key);
        return res.json({stored});
    }

}
