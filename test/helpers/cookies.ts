export function parseCookies(response: Response): Record<string, string> {
  const setCookieHeader = response.headers.get('set-cookie')
  if (!setCookieHeader) return {}

  const cookies: Record<string, string> = {}
  const cookiePairs = setCookieHeader.split(';')

  for (const pair of cookiePairs) {
    const [key, value] = pair.trim().split('=')
    if (key && value) {
      cookies[key] = value
    }
  }

  return cookies
}

export function getSessionIdFromCookie(response: Response): string | null {
  const cookies = parseCookies(response)
  return cookies.sessionId || null
}

export function createCookieHeader(sessionId: string): string {
  return `sessionId=${sessionId}`
}

export function verifyCookieAttributes(setCookieHeader: string | null) {
  if (!setCookieHeader) return null

  return {
    hasHttpOnly: setCookieHeader.includes('HttpOnly'),
    hasSameSite: setCookieHeader.includes('SameSite'),
    hasPath: setCookieHeader.includes('Path=/'),
    hasMaxAge: setCookieHeader.includes('Max-Age'),
  }
}
