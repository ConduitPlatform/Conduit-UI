import { MOCK_ADMIN_ORIGIN } from '../mock-admin/constants.ts';
import type { MockScenario } from '../mock-admin/types.ts';

export async function resetMock(
  scenario: MockScenario = 'ready'
): Promise<void> {
  const response = await fetch(`${MOCK_ADMIN_ORIGIN}/__test__/reset`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ scenario }),
  });
  if (!response.ok) {
    throw new Error(`Mock reset failed: ${response.status}`);
  }
}

export async function revokeMockTokens(): Promise<void> {
  const response = await fetch(`${MOCK_ADMIN_ORIGIN}/__test__/revoke`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Mock revoke failed: ${response.status}`);
  }
}

export type MockInspectState = {
  scenario: string;
  configCount: number;
  backfillCount: number;
  storedApiKeyConfigured: boolean;
  lastSettingsPatchHadApiKey: boolean;
  workersEnabled: boolean;
  modules: string[];
};

export async function inspectMock(): Promise<MockInspectState> {
  const response = await fetch(`${MOCK_ADMIN_ORIGIN}/__test__/state`);
  if (!response.ok) {
    throw new Error(`Mock inspect failed: ${response.status}`);
  }
  return (await response.json()) as MockInspectState;
}
