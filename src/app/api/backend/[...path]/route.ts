import { clearBackendToken, readBackendToken } from '@/libs/BackendSession';
import { Env } from '@/libs/Env';

type BackendPassthroughProps = {
  params: Promise<{ path: string[] }>;
};

/**
 * Forward an authenticated browser call to the Go backend and return its envelope untouched.
 *
 * @param request - Browser request, possibly with a JSON body.
 * @param props - Catch-all backend path segments.
 * @returns The Go response body and status.
 */
async function forward(request: Request, props: BackendPassthroughProps): Promise<Response> {
  const { path } = await props.params;
  const token = await readBackendToken();

  if (token === undefined) {
    return Response.json(
      { error: { code: 'unauthorized', message: 'authentication required' } },
      { status: 401 },
    );
  }

  const target = new URL(path.join('/'), Env.API_BASE_URL);
  target.search = new URL(request.url).search;

  const upstream = await fetch(target, {
    body: request.method === 'GET' ? undefined : await request.text(),
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    method: request.method,
  }).catch(() => null);

  if (upstream === null) {
    return Response.json(
      { error: { code: 'unreachable', message: 'backend is not reachable' } },
      { status: 502 },
    );
  }

  const body = await upstream.text();

  if (upstream.status === 401) {
    await clearBackendToken();
  }

  return new Response(body, {
    headers: { 'Content-Type': 'application/json' },
    status: upstream.status,
  });
}

/**
 * Proxy a GET to the backend with the session token.
 *
 * @param request - Browser request.
 * @param props - Catch-all backend path segments.
 * @returns The Go response body and status.
 */
export async function GET(request: Request, props: BackendPassthroughProps): Promise<Response> {
  return await forward(request, props);
}

/**
 * Proxy a POST to the backend with the session token.
 *
 * @param request - Browser request.
 * @param props - Catch-all backend path segments.
 * @returns The Go response body and status.
 */
export async function POST(request: Request, props: BackendPassthroughProps): Promise<Response> {
  return await forward(request, props);
}

/**
 * Proxy a PUT to the backend with the session token.
 *
 * @param request - Browser request.
 * @param props - Catch-all backend path segments.
 * @returns The Go response body and status.
 */
export async function PUT(request: Request, props: BackendPassthroughProps): Promise<Response> {
  return await forward(request, props);
}
