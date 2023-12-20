import httpProxy from 'http-proxy';

export const proxy = httpProxy.createProxyServer({
  /**
   * Get the actual back-end service url from env variables.
   * We shouldn't prefix the env variable with NEXT_PUBLIC_* to avoid exposing it to the client.
   */
  target: process.env.CONDUIT_URL || 'NULL',
  changeOrigin: true,
  autoRewrite: false,
});
export let proxyLoki: httpProxy | null = null;

if (process.env.LOKI_URL && process.env.LOKI_URL.length > 0) {
  proxyLoki = httpProxy.createProxyServer({
    target: process.env.LOKI_URL,
    changeOrigin: true,
    autoRewrite: false,
  });
}
export let proxyPrometheus: httpProxy | null = null;
if (process.env.PROMETHEUS_URL && process.env.PROMETHEUS_URL.length > 0) {
  proxyPrometheus = httpProxy.createProxyServer({
    /**
     * Get the actual back-end service url from env variables.
     * We shouldn't prefix the env variable with NEXT_PUBLIC_* to avoid exposing it to the client.
     */
    target: process.env.PROMETHEUS_URL,
    changeOrigin: true,
    autoRewrite: false,
  });
}
