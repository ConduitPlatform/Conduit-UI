import ConduitGrpcSdk, { RouterResponse, RouterRequest } from '@quintessential-sft/conduit-grpc-sdk';
import { AuthUtils } from '../utils/auth';
import grpc from 'grpc';
import { isNil } from 'lodash';

export class ServiceAdmin {
  private database: any;

  constructor(private readonly grpcSdk: ConduitGrpcSdk) {
    const self = this;
    self.grpcSdk.waitForExistence('database-provider').then((r) => {
      self.database = self.grpcSdk.databaseProvider;
    });
  }

  async getServices(call: RouterRequest, callback: RouterResponse) {
    const { skip, limit } = JSON.parse(call.request.params);
    let skipNumber = 0,
      limitNumber = 25;

    if (!isNil(skip)) {
      skipNumber = Number.parseInt(skip as string);
    }
    if (!isNil(limit)) {
      limitNumber = Number.parseInt(limit as string);
    }

    const servicesPromise = this.database.findMany(
      'Service',
      {},
      null,
      skipNumber,
      limitNumber,
    );
    const countPromise = this.database.countDocuments('Service', {});

    let errorMessage = null;
    const [services, count] = await Promise.all([servicesPromise, countPromise]).catch(
      (e: any) => (errorMessage = e.message),
    );

    if (!isNil(errorMessage)) {
      return callback({
        code: grpc.status.INTERNAL,
        message: errorMessage,
      });
    }

    return callback(null, { result: JSON.stringify({ services, count }) });
  }

  async createService(call: RouterRequest, callback: RouterResponse) {
    const { name } = JSON.parse(call.request.params);

    if (isNil(name)) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Service name is required',
      });
    }

    let errorMessage = null;
    const token = AuthUtils.randomToken();
    const hashedToken = await AuthUtils.hashPassword(token).catch(
      (e: any) => (errorMessage = e.message),
    );
    if (!isNil(errorMessage))
      return callback({ code: grpc.status.INTERNAL, message: errorMessage });

    await this.database
      .create('Service', { name, hashedToken })
      .catch((e: any) => (errorMessage = e.message));

    if (!isNil(errorMessage)) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Service creation failed',
      });
    }

    this.grpcSdk.bus?.publish('authentication:create:service', JSON.stringify({ name }));

    return callback(null, { result: JSON.stringify({ name, token }) });
  }

  async deleteService(call: RouterRequest, callback: RouterResponse) {
    const { id } = JSON.parse(call.request.params);

    if (isNil(id)) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Service id is required',
      });
    }

    let errorMessage = null;
    await this.database
      .deleteOne('Service', { _id: id })
      .catch((e: any) => (errorMessage = e.message));

    if (!isNil(errorMessage)) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Service deletion failed',
      });
    }

    this.grpcSdk.bus?.publish('authentication:delete:service', JSON.stringify({ id }));

    return callback(null, { result: 'OK' });
  }

  async renewToken(call: RouterRequest, callback: RouterResponse) {
    const { serviceId } = JSON.parse(call.request.params);

    if (isNil(serviceId)) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Service id is required',
      });
    }

    let errorMessage = null;
    const token = AuthUtils.randomToken();
    const hashedToken = await AuthUtils.hashPassword(token).catch(
      (e: any) => (errorMessage = e.message),
    );
    if (!isNil(errorMessage))
      return callback({ code: grpc.status.INTERNAL, message: errorMessage });

    let service = await this.database
      .findByIdAndUpdate('Service', serviceId, { hashedToken }, { new: true })
      .catch((e: any) => (errorMessage = e.message));

    if (!isNil(errorMessage)) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Service update failed',
      });
    }

    return callback(null, { result: JSON.stringify({ name: service.name, token }) });
  }
}