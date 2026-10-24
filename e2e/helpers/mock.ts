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

export type RecordedRequest = {
  method: string;
  path: string;
  query: Record<string, string | string[]>;
  body: unknown;
};

/** Requests the mock served since the last reset or `clearRecordedRequests`. */
export async function recordedRequests(
  filter: { method?: string; path?: string | RegExp } = {}
): Promise<RecordedRequest[]> {
  const response = await fetch(`${MOCK_ADMIN_ORIGIN}/__test__/requests`, {
    headers: testControlHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Mock requests failed: ${response.status}`);
  }
  const { requests } = (await response.json()) as {
    requests: RecordedRequest[];
  };
  return requests.filter(request => {
    if (filter.method && request.method !== filter.method) return false;
    if (typeof filter.path === 'string') return request.path === filter.path;
    if (filter.path) return filter.path.test(request.path);
    return true;
  });
}

export async function clearRecordedRequests(): Promise<void> {
  const response = await fetch(`${MOCK_ADMIN_ORIGIN}/__test__/requests/clear`, {
    method: 'POST',
    headers: testControlHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Mock clear failed: ${response.status}`);
  }
}

/** The authentication state of the mock (teams, users, memberships, ...). */
export async function inspectAuth<T = Record<string, any>>(): Promise<T> {
  const response = await fetch(`${MOCK_ADMIN_ORIGIN}/__test__/auth`, {
    headers: testControlHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Mock auth inspect failed: ${response.status}`);
  }
  return (await response.json()) as T;
}
