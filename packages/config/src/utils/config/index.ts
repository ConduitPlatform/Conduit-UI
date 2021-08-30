import convict, { Config } from 'convict';
import AppConfigSchema from '../../models/config.schema';
import { isNil } from 'lodash';
import { IAppConfig } from '@quintessential-sft/conduit-commons';

export class AppConfig implements IAppConfig {
  private static instance: AppConfig;
  private convictConfig: Config<any>;
  private completeConfigSchema: any;

  static getInstance() {
    if (isNil(AppConfig.instance)) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  get config() {
    return this.convictConfig;
  }

  get configSchema() {
    return this.completeConfigSchema;
  }

  private constructor() {
    this.completeConfigSchema = AppConfigSchema;
    this.convictConfig = convict(this.completeConfigSchema);
    this.validateConfig();
  }

  addModulesConfigSchema(moduleConfigSchema: any) {
    this.completeConfigSchema = { ...this.completeConfigSchema, ...moduleConfigSchema };
    this.convictConfig = convict(this.completeConfigSchema);
    this.validateConfig();
  }

  private validateConfig() {
    // todo maybe change  back to strict but i think strict might not be possible
    this.convictConfig.validate({ allowed: 'warn' });
  }
}

export * from './database';