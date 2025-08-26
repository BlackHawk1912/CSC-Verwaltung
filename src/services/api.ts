// Simple typed fetch wrappers (placeholder endpoints)

type FetchJsonInput = {
  readonly url: string
  readonly method?: 'GET' | 'POST'
  readonly body?: unknown
}

const baseUrl = import.meta.env.VITE_API_URL || ''

const fetchJson = async <T>({ url, method = 'GET', body }: FetchJsonInput): Promise<T> => {
  const res = await fetch(baseUrl + url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as T
}

// Example endpoints (not used yet)
export const api = {
  getStats: () => fetchJson<unknown>({ url: '/stats' }),
  postDisbursement: (p: { strainId: string; grams: number; memberNumber: number }) =>
    fetchJson<{ id: string }>({ url: '/disbursements', method: 'POST', body: p }),
}
