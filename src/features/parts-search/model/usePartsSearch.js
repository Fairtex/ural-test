import { useCallback, useEffect, useRef, useState } from 'react'
import { useLazyGetBrandsQuery, useLazyGetOffersQuery } from '../api/partsApi.js'

const EMPTY_LIST = []
const DEBOUNCE_MS = 400

function useLatestRequest([trigger, query]) {
  const running = useRef(null)
  const revision = useRef(0)
  const [requestId, setRequestId] = useState(null)

  const abort = useCallback(() => {
    revision.current += 1
    const request = running.current
    if (!request) return
    request.abort()
    request.unsubscribe()
    request.then(() => {
      if (running.current === request) running.current = null
    })
  }, [])

  useEffect(() => abort, [abort])

  function cancel() {
    abort()
    setRequestId(null)
  }

  async function start(args) {
    cancel()
    const currentRevision = revision.current
    // RTK Query deduplicates in-flight requests for the same args. Let an aborted
    // request settle before starting again, including a rapid A → B → A selection.
    if (running.current) await running.current
    if (currentRevision !== revision.current) return

    const request = trigger(args)
    running.current = request
    setRequestId(request.requestId)
  }

  const matches = Boolean(requestId) && requestId === query.requestId
  let status = 'loading'
  if (matches && query.status === 'fulfilled') status = 'success'
  if (matches && query.status === 'rejected') status = 'error'

  return {
    start,
    cancel,
    status,
    data: status === 'success' ? query.currentData : EMPTY_LIST,
    error: status === 'error' ? query.error?.message || 'Не удалось загрузить данные.' : '',
  }
}

export default function usePartsSearch() {
  const [article, updateArticle] = useState('')
  const [brand, updateBrand] = useState('')
  const timer = useRef(null)
  const brands = useLatestRequest(useLazyGetBrandsQuery())
  const offers = useLatestRequest(useLazyGetOffersQuery())

  useEffect(() => () => clearTimeout(timer.current), [])

  function setArticle(value) {
    if (value === article) return
    clearTimeout(timer.current)
    brands.cancel()
    offers.cancel()
    updateArticle(value)
    updateBrand('')

    const number = value.trim()
    if (number) timer.current = setTimeout(() => brands.start(number), DEBOUNCE_MS)
  }

  function selectBrand(value) {
    if (value === brand || !brands.data.includes(value)) return
    updateBrand(value)
    offers.start({ number: article.trim(), brand: value })
  }

  function retryBrands() {
    if (brands.status === 'error' && article.trim()) brands.start(article.trim())
  }

  function retryOffers() {
    if (offers.status === 'error' && brand) offers.start({ number: article.trim(), brand })
  }

  return {
    article, setArticle, brand, selectBrand,
    brands: brands.data,
    offers: offers.data,
    brandsStatus: article.trim() ? brands.status : 'idle',
    offersStatus: brand ? offers.status : 'idle',
    brandsError: brands.error,
    offersError: offers.error,
    retryBrands, retryOffers,
  }
}
