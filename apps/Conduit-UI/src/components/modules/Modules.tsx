import React from 'react';
import { Home } from '@mui/icons-material';
import { getModuleIcon, getModuleName, handleModuleNavigation } from './moduleUtils';
import { useAppDispatch } from '../../redux/store';
import { enqueueInfoNotification } from '../../utils/useNotifier';
import { ModuleItem } from 'ui-components';
import Link from 'next/link';

interface IModule {
  moduleName: string;
  url: string;
}

interface Props {
  modules: IModule[];
  itemSelected?: string;
  homeEnabled?: boolean;
  disabled?: boolean;
}

const Modules: React.FC<Props> = ({ modules, homeEnabled, itemSelected, disabled }) => {
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
        <Link href="/" passHref>
          <ModuleItem
            selected={itemSelected === ''}
            icon={<Home color={'inherit'} />}
            title="home"
          />
        </Link>
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
                />
              );
          }
          const currentUrl = handleModuleNavigation(module.moduleName);
          return (
            <Link href={currentUrl} passHref key={index}>
              <ModuleItem
                selected={itemSelected === module.moduleName}
                icon={getModuleIcon(module.moduleName)}
                title={getModuleName(module.moduleName)}
              />
            </Link>
          );
        })}
    </>
  );
};

export default Modules;
