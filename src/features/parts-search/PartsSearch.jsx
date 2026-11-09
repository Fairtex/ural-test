import { useEffect, useRef } from 'react'
import { ArrowUpRight, Component, Search, X } from 'lucide-react'
import usePartsSearch from './model/usePartsSearch.js'
import { isDemo } from './api/partsApi.js'
import BearingDrawing from './ui/BearingDrawing.jsx'
import BrandList from './ui/BrandList.jsx'
import OffersTable from './ui/OffersTable.jsx'
import './parts-search.css'

const examples = ['01089', '7160500039S']

function ResultsPanel({ id, title, count, status, children }) {
  const panel = useRef(null)
  useEffect(() => {
    // Retry keeps focus on the panel while its contents are replaced.
    if (document.activeElement !== panel.current) return
    if (status === 'success' || status === 'error') {
      const target = panel.current.querySelector('[role="listbox"], .offers-viewport')
        ?? panel.current.querySelector('button')
      target?.focus()
    }
  }, [status])
  return <section className="catalog-panel" ref={panel} aria-labelledby={id} tabIndex={-1}>
    <div className="catalog-panel-heading">
      <h2 id={id}>{title}</h2>
      {status === 'success' && <span className="panel-count">{count.toLocaleString('ru-RU')}</span>}
    </div>
    {children}
  </section>
}

function searchStatus(search) {
  if (search.offersStatus === 'loading') return 'Загружаем предложения…'
  if (search.offersStatus === 'success') return `Предложений для ${search.brand}: ${search.offers.length.toLocaleString('ru-RU')}.`
  if (search.offersStatus === 'error') return ''
  if (search.brandsStatus === 'loading') return 'Ищем производителей…'
  if (search.brandsStatus === 'success') return `Производителей для артикула ${search.article}: ${search.brands.length.toLocaleString('ru-RU')}.`
  return ''
}

export default function PartsSearch() {
  const search = usePartsSearch()
  const input = useRef(null)
  function fillArticle(value) {
    search.setArticle(value)
    input.current.focus()
  }
  return (
    <div className="catalog">
      <a className="catalog-skip" href="#catalog-main">К поиску</a>
      <header className="catalog-header">
        <div className="catalog-wrap header-inner">
          <span className="catalog-wordmark"><Component size={28} strokeWidth={2} aria-hidden="true" />Деталь</span>
          <span className="header-section">Каталог запчастей</span>
        </div>
      </header>
      <main className="catalog-wrap catalog-workspace" id="catalog-main" tabIndex={-1}>
        <span className="visually-hidden" role="status" aria-atomic="true">{searchStatus(search)}</span>
        <section className="search-module" aria-labelledby="search-title">
          <div className="drawing-field"><BearingDrawing /></div>
          <div className="search-content">
            <h1 id="search-title">Подбор автозапчастей</h1>
            <p>Найдите деталь по артикулу и сравните предложения складов.</p>
            <label htmlFor="part-article">Артикул детали</label>
            <div className="article-field">
              <Search size={21} strokeWidth={2} aria-hidden="true" />
              <input ref={input} id="part-article" type="text" value={search.article}
                onChange={event => search.setArticle(event.target.value)} autoComplete="off"
                spellCheck={false} placeholder="Введите номер детали" />
              {search.article && <button type="button" className="clear-article" aria-label="Очистить артикул"
                onClick={() => fillArticle('')}><X size={18} aria-hidden="true" /></button>}
            </div>
            <div className="article-examples">
              <span>{isDemo ? 'Артикулы для демо' : 'Например'}</span>
              {examples.map(example =>
                <button key={example} type="button" onClick={() => fillArticle(example)}>
                  {example}<ArrowUpRight size={13} aria-hidden="true" />
                </button>)}
              {search.brandsStatus === 'success' && search.brands.length > 0 &&
                <a className="brands-jump" href="#brand-options">К производителям ({search.brands.length})</a>}
            </div>
          </div>
        </section>
        <div className="results-layout">
          <ResultsPanel title="Производители" id="brands-title"
            status={search.brandsStatus} count={search.brands.length}>
            <BrandList key={search.article} brands={search.brands} selected={search.brand}
              status={search.brandsStatus} error={search.brandsError} onRetry={search.retryBrands}
              onSelect={search.selectBrand} example={isDemo ? examples[0] : null} onExample={fillArticle} />
          </ResultsPanel>
          <ResultsPanel title="Предложения" id="offers-title"
            status={search.offersStatus} count={search.offers.length}>
            <OffersTable key={search.article + ':' + search.brand} offers={search.offers}
              status={search.offersStatus} error={search.offersError} onRetry={search.retryOffers} />
          </ResultsPanel>
        </div>
      </main>
    </div>
  )
}
