import { ConnectionOptions, Mongoose } from 'mongoose';
import { MongooseSchema } from './MongooseSchema';
import { schemaConverter } from './SchemaConverter';
import { ConduitError, ConduitSchema } from '@quintessential-sft/conduit-grpc-sdk';
import { DatabaseAdapter } from '../../interfaces';
import { systemRequiredValidator } from '../utils/validateSchemas';

let deepPopulate = require('mongoose-deep-populate');

export class MongooseAdapter implements DatabaseAdapter {
  connected: boolean = false;
  mongoose: Mongoose;
  connectionString: string;
  options: ConnectionOptions = {
    keepAlive: true,
    poolSize: 10,
    connectTimeoutMS: 30000,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  };
  models?: { [name: string]: MongooseSchema };
  registeredSchemas: Map<string, ConduitSchema>;

  constructor(connectionString: string) {
    this.registeredSchemas = new Map();
    this.connectionString = connectionString;
    this.mongoose = new Mongoose();
    this.connect();
  }

  async ensureConnected(): Promise<any> {
    return new Promise((resolve, reject) => {
      let db = this.mongoose.connection;
      db.on('connected', () => {
        console.log('MongoDB dashboard is connected');
        resolve();
      });

      db.on('error', (err: any) => {
        console.error('Dashboard Connection error:', err.message);
        reject();
      });

      db.once('open', function callback() {
        console.info('Connected to Dashboard Database!');
        resolve();
      });

      db.on('reconnected', function () {
        console.log('Dashboard Database reconnected!');
        resolve();
      });

      db.on('disconnected', function () {
        console.log('Dashboard Database Disconnected');
        reject();
      });
    });
  }

  connect() {
    this.mongoose
      .connect(this.connectionString, this.options)
      .then(() => {
        deepPopulate = deepPopulate(this.mongoose);
      })
      .catch((err: any) => {
        console.log(err);
        throw new Error('Connection with Mongo not possible');
      });
  }

  createSchemaFromAdapter(schema: ConduitSchema): Promise<MongooseSchema> {
    const Schema = this.mongoose.Schema;
    if (!this.models) {
      this.models = {};
    }

    if (this.registeredSchemas.has(schema.name)) {
      if (schema.name !== 'Config') {
        try {
          schema = systemRequiredValidator(this.registeredSchemas.get(schema.name)!, schema);
        } catch (err) {
          return new Promise((resolve, reject) => {
            reject(err);
          });
        }
        // TODO this is a temporary solution because there was an error on updated config schema for invalid schema fields
      }
      delete this.mongoose.connection.models[schema.name];
    }

    let newSchema = schemaConverter(schema);

    this.registeredSchemas.set(schema.name, schema);
    this.models[schema.name] = new MongooseSchema(
      this.mongoose,
      newSchema,
      deepPopulate,
      this
    );
    return new Promise((resolve, reject) => {
      resolve(this.models![schema.name]);
    });
  }

  getSchema(schemaName: string): ConduitSchema {
    if (this.models && this.models![schemaName]) {
      return this.models![schemaName].originalSchema;
    }
    throw new Error(`Schema ${schemaName} not defined yet`);
  }

  getSchemas(): ConduitSchema[] {
    if (!this.models) {
      return [];
    }

    const self = this;
    return Object.keys(this.models).map((modelName) => {
      return self.models![modelName].originalSchema;
    });
  }

  getSchemaModel(schemaName: string): { model: MongooseSchema, relations: any } {
    if (this.models && this.models![schemaName]) {
      return { model: this.models![schemaName], relations: null };
    }
    throw new Error(`Schema ${schemaName} not defined yet`);
  }

  deleteSchema(schemaName: string) {
    if (!this.models?.[schemaName])
      throw ConduitError.notFound('Requested schema not found');
    if (this.models![schemaName].originalSchema.modelOptions.systemRequired) {
      throw ConduitError.forbidden("Can't delete system required schema");
    }
    delete this.models![schemaName];
    delete this.mongoose.connection.models[schemaName];
    // TODO should we delete anything else?
  }
}