import { useRef } from 'react'
import { ArrowUpRight, Component, Database, Search, X } from 'lucide-react'
import usePartsSearch from './model/usePartsSearch.js'
import { isDemo } from './api/partsApi.js'
import BearingDrawing from './ui/BearingDrawing.jsx'
import BrandList from './ui/BrandList.jsx'
import OffersTable from './ui/OffersTable.jsx'
import './parts-search.css'

function PanelHeading({ id, step, title, count }) {
  return <div className="catalog-panel-heading">
    <span className="panel-step" aria-label={'Этап ' + step}>0{step}</span>
    <h2 id={id}>{title}</h2>
    {count != null && <span className="panel-count">{count.toLocaleString('ru-RU')}</span>}
  </div>
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
          <span className="data-mode"><Database size={15} aria-hidden="true" />{isDemo ? 'Деморежим' : 'Данные Фаворит'}</span>
        </div>
      </header>
      <main className="catalog-wrap catalog-workspace" id="catalog-main" tabIndex={-1}>
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
              <span>Например</span>
              {['01089', '7160500039S'].map(example =>
                <button key={example} type="button" onClick={() => fillArticle(example)}>
                  {example}<ArrowUpRight size={13} aria-hidden="true" />
                </button>)}
            </div>
          </div>
        </section>
        <div className="results-layout">
          <section className="catalog-panel" aria-labelledby="brands-title">
            <PanelHeading step={1} title="Производители" id="brands-title"
              count={search.brandsStatus === 'success' ? search.brands.length : null} />
            <BrandList key={search.article} brands={search.brands} selected={search.brand}
              status={search.brandsStatus} error={search.brandsError} onRetry={search.retryBrands}
              onSelect={search.selectBrand} />
          </section>
          <section className="catalog-panel" aria-labelledby="offers-title">
            <PanelHeading step={2} title="Предложения" id="offers-title"
              count={search.offersStatus === 'success' ? search.offers.length : null} />
            <OffersTable key={search.article + ':' + search.brand} offers={search.offers}
              status={search.offersStatus} error={search.offersError} onRetry={search.retryOffers} />
          </section>
        </div>
      </main>
    </div>
  )
}
