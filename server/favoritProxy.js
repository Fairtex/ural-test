const endpoint = 'https://api.favorit-parts.ru/hs/hsprice/'
const route = '/api/parts'

function sendError(response, status, error) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify({ error }))
}

function isAllowedOrigin(request) {
  const site = request.headers['sec-fetch-site']
  if (site && site !== 'same-origin' && site !== 'none') return false

  const origin = request.headers.origin
  const protocol = request.socket.encrypted ? 'https' : 'http'
  return origin === undefined || origin === `${protocol}://${request.headers.host}`
}

// Dev-only endpoint. The browser sends only the part number and optional brand.
export function favoritProxy(apiKey) {
  return {
    name: 'favorit-local-api',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const target = request.url
        if (target.startsWith('//')) return sendError(response, 400, 'Некорректный путь запроса.')
        if (target !== route && !target.startsWith(route + '?')) return next()
        if (request.method !== 'GET') return sendError(response, 405, 'Разрешён только GET.')
        if (!isAllowedOrigin(request)) return sendError(response, 403, 'Запрос с другого источника запрещён.')
        if (!apiKey) return sendError(response, 503, 'Укажите FAVORIT_API_KEY для локального сервера.')

        const params = new URLSearchParams(target.slice(route.length))
        const number = params.get('number')?.trim()
        if (!number) return sendError(response, 400, 'Введите артикул.')
        const upstream = new URL(endpoint)
        upstream.searchParams.set('key', apiKey)
        upstream.searchParams.set('number', number)
        const brand = params.get('brand')
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
