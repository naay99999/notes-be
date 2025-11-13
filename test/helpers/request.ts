export function createRequest(
  url: string,
  options?: RequestInit & { cookies?: string }
): Request {
  const headers = new Headers(options?.headers)

  if (options?.cookies) {
    headers.set('Cookie', options.cookies)
  }

  return new Request(url, {
    ...options,
    headers,
  })
}

export function createJsonRequest(
  url: string,
  method: string,
  body?: unknown,
  options?: { cookies?: string }
): Request {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (options?.cookies) {
    headers['Cookie'] = options.cookies
  }

  return new Request(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
}

export async function expectJsonResponse(
  response: Response,
  expectedStatus: number
) {
  expect(response.status).toBe(expectedStatus)
  expect(response.headers.get('content-type')).toContain('application/json')
  return response.json()
}
