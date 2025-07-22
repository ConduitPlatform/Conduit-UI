import { getRoutes } from '@/lib/api/router';
import { RouterVisualization } from '@/components/router/visualization';

export default async function RouterVisualizationPage() {
  const data = await getRoutes();
  console.log('Router visualization API response:', data);
  return <RouterVisualization data={data} />;
}
