import React, { useCallback } from 'react';
import { Home } from '@mui/icons-material';
import { getModuleIcon, getModuleName } from './moduleUtils';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { enqueueInfoNotification } from '../../utils/useNotifier';
import { ModuleItem, LinkComponent } from '@conduitplatform/ui-components';

interface IModule {
  moduleName: string;
  url: string;
}

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

  const handleDisabledClick = () => {
    dispatch(enqueueInfoNotification('Module currently disabled.'));
  };

  const modulesInstance = [...modules];
  const sortedArray = modulesInstance.sort((a, b) => {
    const textA = a.moduleName.toUpperCase();
    const textB = b.moduleName.toUpperCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });

  const moduleItem = useCallback(
    (name, index) => {
      const configEnabled = (moduleName: string) => {
        switch (moduleName) {
          case 'authentication':
            return enabledAuth ? '/authentication/users' : '/authentication/config';
          case 'email':
            return enabledEmail ? '/email/templates' : '/email/config';
          case 'database':
            return '/database/schemas';
          case 'storage':
            return enabledStorage ? '/storage/files' : '/storage/config';
          case 'settings':
            return '/settings/settings';
          case 'pushNotifications':
            return enabledNotifications ? '/push-notifications/send' : '/push-notifications/config';
          case 'forms':
            return enabledForms ? '/forms/view' : '/forms/config';
          case 'payments':
            return enabledPayments ? '/payments/customers' : 'payments/config';
          case 'sms':
            return enabledSms ? '/sms/send' : '/sms/config';
          case 'router':
            return '/router/settings';
          case 'chat':
            return enabledChat ? '/chat/rooms' : '/chat/config';
          default:
            return `/${moduleName}`;
        }
      };

      const currentUrl = configEnabled(name);
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
      smallScreen,
    ]
  );

  return (
    <>
      {homeEnabled ? (
        <LinkComponent href="/">
          <ModuleItem
            selected={itemSelected === ''}
            icon={<Home color={'inherit'} width={24} height={24} />}
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
