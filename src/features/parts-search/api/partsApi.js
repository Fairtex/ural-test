import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import demoCatalogUrl from './demo/catalog.json?url&no-inline'
import { createDemoResponse } from './demo/createDemoResponse.js'
import { getBrands, getOffers } from './normalizeResponse.js'

export const isDemo = import.meta.env.VITE_DATA_MODE !== 'live'

const fetchJson = fetchBaseQuery({ timeout: 20_000 })

function messageForError(status, details) {
  const message = String(details ?? '')
  if (/quota/i.test(message) || status === 429) {
    return 'Лимит запросов исчерпан. Повторите поиск позже.'
  }
  if (/empty key|invalid key/i.test(message) || status === 401 || status === 403) {
    return 'Сервис не принял ключ доступа. Проверьте настройки подключения.'
  }
  if (/empty number/i.test(message)) return 'Введите артикул детали.'
  if (status === 'TIMEOUT_ERROR') return 'Сервис долго не отвечает. Повторите запрос.'
  if (status === 'FETCH_ERROR') return 'Нет связи с сервисом. Проверьте подключение к сети.'
  return 'Не удалось получить ответ сервиса. Повторите запрос.'
}

async function requestParts(params, api, options) {
  const request = isDemo
    ? { url: demoCatalogUrl }
    : { url: '/api/parts', params: params.brand ? { ...params, analogues: 'on' } : params }
  const result = await fetchJson(request, api, options)

  if (result.error) {
    const { data, originalStatus, status } = result.error
    const code = originalStatus ?? status
    return { error: { status: code, message: messageForError(code, data?.error ?? data) } }
  }

  const payload = isDemo ? createDemoResponse(result.data, params) : result.data
  if (payload?.error) {
    return { error: { status: 'API_ERROR', message: messageForError(null, payload.error) } }
  }
  if (!Array.isArray(payload?.goods)) {
    return { error: { status: 'INVALID_RESPONSE', message: 'Сервис вернул данные в неожиданном формате.' } }
  }
  return { data: params.brand ? getOffers(payload.goods) : getBrands(payload.goods) }
}

export const partsApi = createApi({
  reducerPath: 'partsApi',
  baseQuery: requestParts,
  // Release large warehouse lists as soon as the search stops using them.
  keepUnusedDataFor: 0,
  endpoints: (build) => ({
    getBrands: build.query({ query: (number) => ({ number }) }),
    getOffers: build.query({ query: ({ number, brand }) => ({ number, brand }) }),
  }),
})

export const { useLazyGetBrandsQuery, useLazyGetOffersQuery } = partsApi
