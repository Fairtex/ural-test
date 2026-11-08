const endpoint = 'https://api.favorit-parts.ru/hs/hsprice/'

function sendError(response, status, error) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify({ error }))
}

// Dev-only endpoint. The browser sends only the part number and optional brand.
export function favoritProxy(apiKey) {
  return {
    name: 'favorit-local-api',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url, 'http://localhost')
        if (url.pathname !== '/api/parts') return next()
        if (request.method !== 'GET') return sendError(response, 405, 'Разрешён только GET.')
        if (!apiKey) return sendError(response, 503, 'Укажите FAVORIT_API_KEY для локального сервера.')

        const number = url.searchParams.get('number')?.trim()
        if (!number) return sendError(response, 400, 'Введите артикул.')
        const upstream = new URL(endpoint)
        upstream.searchParams.set('key', apiKey)
        upstream.searchParams.set('number', number)
        const brand = url.searchParams.get('brand')
        if (brand) {
          upstream.searchParams.set('brand', brand)
          upstream.searchParams.set('analogues', 'on')
        }

        const controller = new AbortController()
        const disconnect = () => controller.abort()
        response.once('close', disconnect)
        const timeout = setTimeout(disconnect, 30000)
        try {
          const result = await fetch(upstream, { signal: controller.signal, redirect: 'error' })
          const payload = await result.json()
          if (response.destroyed) return
          response.writeHead(result.status, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
          })
          response.end(JSON.stringify(payload))
        } catch {
          if (response.destroyed) return
          if (controller.signal.aborted) return sendError(response, 504, 'Сервис не ответил вовремя.')
          sendError(response, 502, 'Не удалось получить ответ сервиса.')
        } finally {
          clearTimeout(timeout)
          response.off('close', disconnect)
        }
      })
    },
  }
}
