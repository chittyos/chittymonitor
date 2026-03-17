export interface Env {
  MONITOR_AGENT: DurableObjectNamespace;
  MONITOR_CACHE: KVNamespace;
  SERVICE_NAME: string;
  CHITTY_AUTH_SERVICE_TOKEN?: string;
}
