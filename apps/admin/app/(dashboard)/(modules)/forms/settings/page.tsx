import { Settings } from '@/components/forms/settings';
import { getFormsSettings } from '@/lib/api/forms';
import { getRouterSettings } from '@/lib/api/router';
import { getModules } from '@/lib/api/modules';

export default async function FormsSettings() {
  const { config: data } = await getFormsSettings();
  const modules = await getModules();
  let captchaAvailable = false;
  const routerServing = !!modules.find(
    m => m.moduleName === 'router' && m.serving
  );
  if (routerServing) {
    const { config: routerCfg } = await getRouterSettings();
    captchaAvailable = routerCfg.captcha.enabled;
  }

  return <Settings data={data} captchaAvailable={captchaAvailable} />;
}
