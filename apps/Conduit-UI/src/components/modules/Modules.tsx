import React, { useCallback } from 'react';
import { getModuleIcon, getModuleName } from './moduleUtils';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { enqueueInfoNotification } from '../../hooks/useNotifier';
import { ModuleItem, LinkComponent } from '@conduitplatform/ui-components';
import { IModule } from '../../models/appAuth';

interface Props {
  modules: IModule[];
  itemSelected?: string;
  homeEnabled?: boolean;
  disabled?: boolean;
  smallScreen: boolean;
}

const Modules: React.FC<Props> = ({
  modules,
  homeEnabled,
  itemSelected,
  disabled,
  smallScreen,
}) => {
  const dispatch = useAppDispatch();
  const enabledAuth = useAppSelector((state) => state.authenticationSlice.data.config.active);
  const enabledEmail = useAppSelector((state) => state.emailsSlice.data.config.active);
  const enabledStorage = useAppSelector((state) => state.storageSlice.data.config.active);
  const enabledNotifications = useAppSelector(
    (state) => state.notificationsSlice.data.config.active
  );
  const enabledForms = useAppSelector((state) => state.formsSlice.data.config.active);
  const enabledChat = useAppSelector((state) => state.chatSlice.config.active);
  const enabledSms = useAppSelector((state) => state.smsSlice.data.config.active);
  const enabledPayments = useAppSelector((state) => state.paymentsSlice.data.config.active);
  const { metricsAvailable } = useAppSelector((state) => state.appSlice.info);

  const handleDisabledClick = () => {
    dispatch(enqueueInfoNotification('Module currently disabled.', 'moduleDisabled'));
  };

  const modulesInstance = modules ? [...modules] : [];
  const sortedArray = modulesInstance?.sort((a, b) => {
    const textA = a.moduleName.toUpperCase();
    const textB = b.moduleName.toUpperCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });

  const moduleItem = useCallback(
    (name, index) => {
      const handleCurrentUrl = (moduleName: string) => {
        switch (moduleName) {
          case 'authentication':
            return !enabledAuth
              ? '/authentication/config'
              : metricsAvailable
              ? '/authentication/dashboard'
              : '/authentication/users';
          case 'email':
            return !enabledEmail
              ? '/email/config'
              : metricsAvailable
              ? '/email/dashboard'
              : '/email/templates';
          case 'database':
            return metricsAvailable ? '/database/dashboard' : '/database/schemas';
          case 'storage':
            return !enabledStorage
              ? '/storage/config'
              : metricsAvailable
              ? '/storage/dashboard'
              : '/storage/files';
          case 'settings':
            return '/settings/settings';
          case 'pushNotifications':
            return !enabledNotifications
              ? '/push-notifications/config'
              : metricsAvailable
              ? '/push-notifications/dashboard'
              : '/push-notifications/send';
          case 'forms':
            return !enabledForms
              ? '/forms/config'
              : metricsAvailable
              ? '/forms/dashboard'
              : '/forms/view';
          case 'payments':
            return !enabledPayments
              ? '/payments/config'
              : metricsAvailable
              ? '/payments/dashboard'
              : '/payments/customers';
          case 'sms':
            return !enabledSms ? '/sms/config' : metricsAvailable ? '/sms/dashboard' : '/sms/send';
          case 'router':
            return metricsAvailable ? '/router/dashboard' : '/router/routes';
          case 'chat':
            return !enabledChat
              ? '/chat/config'
              : metricsAvailable
              ? '/chat/dashboard'
              : '/chat/rooms';
          default:
            return `/${moduleName}`;
        }
      };

      const currentUrl = handleCurrentUrl(name);
      return (
        <LinkComponent href={currentUrl} key={index}>
          <ModuleItem
            selected={itemSelected === name}
            icon={getModuleIcon(name)}
            title={getModuleName(name)}
            smallScreen={smallScreen}
          />
        </LinkComponent>
      );
    },
    [
      enabledAuth,
      enabledChat,
      enabledEmail,
      enabledForms,
      enabledNotifications,
      enabledPayments,
      enabledSms,
      enabledStorage,
      itemSelected,
      metricsAvailable,
      smallScreen,
    ]
  );

  return (
    <>
      {homeEnabled ? (
        <LinkComponent href="/">
          <ModuleItem
            selected={itemSelected === ''}
            icon={getModuleIcon('home')}
            title={'home'}
            smallScreen={smallScreen}
          />
        </LinkComponent>
      ) : (
        <></>
      )}
      {sortedArray &&
        sortedArray.map((module, index) => {
          if (disabled) {
            if (getModuleName(module.moduleName) === 'payments') {
              return;
            } else
              return (
                <ModuleItem
                  icon={getModuleIcon(module.moduleName)}
                  title={getModuleName(module.moduleName)}
                  onClick={() => handleDisabledClick()}
                  key={index}
                  disabled={disabled}
                  smallScreen={smallScreen}
                />
              );
          }
          return moduleItem(module.moduleName, index);
        })}
    </>
  );
};

export default Modules;
