export interface Env {
  DB: D1Database;
  APP_NAME?: string;
  ALLOWED_ORIGINS?: string;
}

function getAllowedOrigins(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function buildCorsHeaders(origin: string | null, rawOrigins?: string): Headers {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });

  const allowed = getAllowedOrigins(rawOrigins);
  if (origin && (allowed.includes(origin) || allowed.includes('*'))) {
    headers.set('access-control-allow-origin', origin);
    headers.set('access-control-allow-methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    headers.set('access-control-allow-headers', 'Content-Type, Authorization, X-Requested-With');
    headers.set('access-control-max-age', '86400');
  }

  return headers;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const corsHeaders = buildCorsHeaders(origin, env.ALLOWED_ORIGINS);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          ok: true,
          app: env.APP_NAME ?? 'CEO v100 Central',
          timestamp: new Date().toISOString(),
          d1: !!env.DB,
        }, null, 2),
        { status: 200, headers: corsHeaders }
      );
    }

    if (url.pathname === '/') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          name: env.APP_NAME ?? 'CEO v100 Central',
          mode: 'cloudflare-worker',
          health: '/health',
          db: !!env.DB,
        }, null, 2),
        { status: 200, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Not found',
        path: url.pathname,
      }, null, 2),
      { status: 404, headers: corsHeaders }
    );
  },
};
