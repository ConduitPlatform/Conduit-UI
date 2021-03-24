import { IPushNotificationsProvider } from './interfaces/IPushNotificationsProvider';
import { IFirebaseSettings } from './interfaces/IFirebaseSettings';
import { FirebaseProvider } from './providers/firebase';
import PushNotificationsConfigSchema from './config';
import { isNil } from 'lodash';
import path from 'path';
import ConduitGrpcSdk, {
  GrpcServer,
  GrpcRequest,
  GrpcResponse,
  SetConfigRequest,
  SetConfigResponse,
} from '@quintessential-sft/conduit-grpc-sdk';
import * as grpc from 'grpc';
import { AdminHandler } from './admin/admin';
import { PushNotificationsRoutes } from './routes/Routes';
import * as models from './models';

type SetNotificationTokenRequest = GrpcRequest<{
  token: string,
  platform: string,
  userId: string,
}>;

type SetNotificationTokenResponse = GrpcResponse<{
  newTokenDocument: string,
}>;

type GetNotificationTokensRequest = GrpcRequest<{
  userId: string,
}>;

type GetNotificationTokensResponse = GrpcResponse<{
  tokenDocuments: string[],
}>;

export default class PushNotificationsModule {
  private _provider: IPushNotificationsProvider | undefined;
  private isRunning: boolean = false;
  private readonly grpcServer: GrpcServer;
  private _url: string;
  // @ts-ignore
  private adminHandler: AdminHandler;
  private _routes: any[];

  constructor(private readonly grpcSdk: ConduitGrpcSdk) {
    this.grpcServer = new GrpcServer(process.env.SERVICE_URL);
    this._url = this.grpcServer.url;
    this.grpcServer
      .addService(
        path.resolve(__dirname, './push-notifications.proto'),
        'pushnotifications.PushNotifications',
        {
          setConfig: this.setConfig.bind(this),
          setNotificationToken: this.setNotificationToken.bind(this),
          getNotificationTokens: this.getNotificationTokens.bind(this),
        }
      )
      .then(() => {
        return this.grpcServer.start();
      })
      .then(() => {
        console.log('Grpc server is online');
      })
      .catch((err: Error) => {
        console.log('Failed to initialize server');
        console.error(err);
        process.exit(-1);
      });

    let router = new PushNotificationsRoutes(this.grpcServer, this.grpcSdk);
    this._routes = router.registeredRoutes;

    this.grpcSdk
      .waitForExistence('database-provider')
      .then(() => {
        return this.grpcSdk.config.get('pushNotifications');
      })
      .catch(() => {
        return this.grpcSdk.config.updateConfig(
          PushNotificationsConfigSchema.getProperties(),
          'pushNotifications'
        );
      })
      .then(() => {
        return this.grpcSdk.config.addFieldstoConfig(
          PushNotificationsConfigSchema.getProperties(),
          'pushNotifications'
        );
      })
      .catch(() => {
        console.log('pushNotifications config did not update');
      })
      .then((notificationsConfig: any) => {
        if (notificationsConfig.active) {
          return this.enableModule();
        } else {
          return console.log('Will wait for proper config');
        }
      })
      .catch(console.log);
  }

  get routes() {
    return this._routes;
  }

  get url(): string {
    return this._url;
  }

  async setConfig(call: SetConfigRequest, callback: SetConfigResponse) {
    const newConfig = JSON.parse(call.request.newConfig);

    if (!PushNotificationsConfigSchema.load(newConfig).validate()) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Invalid configuration values',
      });
    }

    let errorMessage: string | null = null;
    const updateResult = await this.grpcSdk.config
      .updateConfig(newConfig, 'pushNotifications')
      .catch((e: Error) => (errorMessage = e.message));
    if (!isNil(errorMessage)) {
      throw new Error(errorMessage);
    }

    const notificationsConfig = await this.grpcSdk.config.get('pushNotifications');
    if (notificationsConfig.active) {
      await this.enableModule().catch((e: Error) => (errorMessage = e.message));
    } else {
      return callback({
        code: grpc.status.FAILED_PRECONDITION,
        message: 'Module is not active',
      });
    }
    if (!isNil(errorMessage)) {
      return callback({ code: grpc.status.INTERNAL, message: errorMessage });
    }

    return callback(null, { updatedConfig: JSON.stringify(updateResult) });
  }

  async setNotificationToken(call: SetNotificationTokenRequest, callback: SetNotificationTokenResponse) {
    const { token, platform, userId } = call.request;

    let errorMessage: any = null;
    this.grpcSdk
      .databaseProvider!.findOne('NotificationToken', { userId, platform })
      .then((oldToken) => {
        if (!isNil(oldToken))
          return this.grpcSdk.databaseProvider!.deleteOne('NotificationToken', oldToken);
      })
      .catch((e) => (errorMessage = e.message));
    if (!isNil(errorMessage))
      return callback({ code: grpc.status.INTERNAL, message: errorMessage });

    const newTokenDocument = await this.grpcSdk
      .databaseProvider!.create('NotificationToken', {
        userId,
        token,
        platform,
      })
      .catch((e) => (errorMessage = e.message));
    if (!isNil(errorMessage))
      return callback({ code: grpc.status.INTERNAL, message: errorMessage });

    return callback(null, { newTokenDocument: JSON.stringify(newTokenDocument) });
  }

  async getNotificationTokens(call: GetNotificationTokensRequest, callback: GetNotificationTokensResponse) {
    const userId = call.request.userId;

    let errorMessage = null;
    const tokenDocuments: any = await this.grpcSdk
      .databaseProvider!.findMany('NotificationToken', { userId })
      .catch((e) => (errorMessage = e.message));
    if (!isNil(errorMessage))
      return callback({ code: grpc.status.INTERNAL, message: errorMessage });

    return callback(null, { tokenDocuments: tokenDocuments });
  }

  private async enableModule() {
    if (!this.isRunning) {
      await this.initProvider();
      await this.registerSchemas();
      this.adminHandler = new AdminHandler(
        this.grpcServer,
        this.grpcSdk,
        this._provider!
      );
      this.isRunning = true;
    } else {
      await this.initProvider();
      this.adminHandler.updateProvider(this._provider!);
    }
  }

  private async initProvider() {
    const notificationsConfig = await this.grpcSdk.config.get('pushNotifications');
    const name = notificationsConfig.providerName;
    const settings = notificationsConfig[name];

    if (name === 'firebase') {
      this._provider = new FirebaseProvider(settings as IFirebaseSettings);
    } else {
      // this was done just for now so that we surely initialize the _provider variable
      this._provider = new FirebaseProvider(settings as IFirebaseSettings);
    }
  }

  private registerSchemas() {
    const promises = Object.values(models).map((model) => {
      return this.grpcSdk.databaseProvider!.createSchemaFromAdapter(model);
    });
    return Promise.all(promises);
  }
}