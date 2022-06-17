import React from 'react';
import { Home } from '@mui/icons-material';
import { getModuleIcon, getModuleName, handleModuleNavigation } from './moduleUtils';
import { useAppDispatch } from '../../redux/store';
import { enqueueInfoNotification } from '../../utils/useNotifier';
import { ModuleItem } from '@conduitplatform/ui-components';
import { LinkComponent } from '@conduitplatform/ui-components';

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

  const handleDisabledClick = () => {
    dispatch(enqueueInfoNotification('Module currently disabled.'));
  };

  const modulesInstance = [...modules];
  const sortedArray = modulesInstance.sort((a, b) => {
    const textA = a.moduleName.toUpperCase();
    const textB = b.moduleName.toUpperCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });

  return (
    <>
      {homeEnabled ? (
        <LinkComponent href="/" underline={'none'}>
          <ModuleItem
            selected={itemSelected === ''}
            icon={<Home color={'inherit'} />}
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
          const currentUrl = handleModuleNavigation(module.moduleName);
          return (
            <LinkComponent href={currentUrl} key={index} underline={'none'}>
              <ModuleItem
                selected={itemSelected === module.moduleName}
                icon={getModuleIcon(module.moduleName)}
                title={getModuleName(module.moduleName)}
                smallScreen={smallScreen}
              />
            </LinkComponent>
          );
        })}
    </>
  );
};

export default Modules;
