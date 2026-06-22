export function formatCommunicationsApiError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as {
      response?: { status?: number; data?: { message?: string } };
      message?: string;
    };
    if (axiosErr.response?.status === 404) {
      return 'Unified templates API not available — upgrade Conduit to a build that includes CommunicationTemplate CRUD';
    }
    return (
      axiosErr.response?.data?.message ?? axiosErr.message ?? 'Request failed'
    );
  }
  return err instanceof Error ? err.message : 'Request failed';
}
