import Stripe from 'stripe';

export interface Env {
  DB: D1Database;
  APP_NAME?: string;
  ALLOWED_ORIGINS?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
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
    headers.set('access-control-allow-headers', 'Content-Type, Authorization, X-Requested-With, Stripe-Signature');
    headers.set('access-control-max-age', '86400');
  }

  return headers;
}

async function logStripeEvent(env: Env, eventType: string, payload: unknown) {
  if (!env.DB) return;

  try {
    await env.DB.prepare(
      `INSERT INTO chain_events (event_type, payload_json, provider, created_at) VALUES (?, ?, ?, ?)`
    )
      .bind(eventType, JSON.stringify(payload), 'stripe', new Date().toISOString())
      .run();
  } catch (error) {
    console.warn('Stripe event log skipped:', error);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const corsHeaders = buildCorsHeaders(origin, env.ALLOWED_ORIGINS);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method === 'POST' && url.pathname === '/billing/webhook') {
      if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
        return new Response(
          JSON.stringify({ ok: false, error: 'Missing Stripe secrets' }, null, 2),
          { status: 500, headers: corsHeaders }
        );
      }

      const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-02-24.acacia',
      });

      const rawBody = await request.text();
      const signature = request.headers.get('stripe-signature');

      if (!signature) {
        return new Response(
          JSON.stringify({ ok: false, error: 'Missing stripe-signature header' }, null, 2),
          { status: 400, headers: corsHeaders }
        );
      }

      try {
        const event = stripe.webhooks.constructEvent(
          rawBody,
          signature,
          env.STRIPE_WEBHOOK_SECRET
        );

        await logStripeEvent(env, event.type, event.data?.object ?? event);

        return new Response(
          JSON.stringify({ ok: true, received: true, eventType: event.type }, null, 2),
          { status: 200, headers: corsHeaders }
        );
      } catch (error) {
        console.error('Stripe webhook verification failed:', error);
        return new Response(
          JSON.stringify({ ok: false, error: 'Webhook verification failed' }, null, 2),
          { status: 400, headers: corsHeaders }
        );
      }
    }

    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify(
          {
            ok: true,
            app: env.APP_NAME ?? 'CEO v100 Central',
            timestamp: new Date().toISOString(),
            d1: !!env.DB,
            stripe: !!env.STRIPE_SECRET_KEY,
          },
          null,
          2
        ),
        { status: 200, headers: corsHeaders }
      );
    }

    if (url.pathname === '/') {
      return new Response(
        JSON.stringify(
          {
            status: 'ok',
            name: env.APP_NAME ?? 'CEO v100 Central',
            mode: 'cloudflare-worker',
            health: '/health',
            db: !!env.DB,
          },
          null,
          2
        ),
        { status: 200, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ ok: false, error: 'Not found', path: url.pathname }, null, 2),
      { status: 404, headers: corsHeaders }
    );
  },
};
