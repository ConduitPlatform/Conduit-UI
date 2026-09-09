import {
  E2E_TEST_CONTROL_HEADER,
  E2E_TEST_CONTROL_TOKEN,
  MOCK_ADMIN_ORIGIN,
} from '../mock-admin/constants.ts';
import type { MockScenario } from '../mock-admin/types.ts';

function testControlHeaders(
  extra?: Record<string, string>
): Record<string, string> {
  return {
    [E2E_TEST_CONTROL_HEADER]: E2E_TEST_CONTROL_TOKEN,
    ...extra,
  };
}

export async function resetMock(
  scenario: MockScenario = 'ready'
): Promise<void> {
  const response = await fetch(`${MOCK_ADMIN_ORIGIN}/__test__/reset`, {
    method: 'POST',
    headers: testControlHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify({ scenario }),
  });
  if (!response.ok) {
    throw new Error(`Mock reset failed: ${response.status}`);
  }
}

export async function revokeMockTokens(): Promise<void> {
  const response = await fetch(`${MOCK_ADMIN_ORIGIN}/__test__/revoke`, {
    method: 'POST',
    headers: testControlHeaders(),
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
  const response = await fetch(`${MOCK_ADMIN_ORIGIN}/__test__/state`, {
    headers: testControlHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Mock inspect failed: ${response.status}`);
  }
  return (await response.json()) as MockInspectState;
}
