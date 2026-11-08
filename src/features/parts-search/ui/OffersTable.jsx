import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ArrowDown, ArrowDownUp, ArrowUp, PackageSearch } from 'lucide-react'
import PanelState from './PanelState.jsx'

const currency = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' })
const quantity = new Intl.NumberFormat('ru-RU')
const sortOptions = [
  { value: 'price-asc', key: 'price', ascending: true, label: 'Цена: сначала дешевле' },
  { value: 'price-desc', key: 'price', ascending: false, label: 'Цена: сначала дороже' },
  { value: 'stock-desc', key: 'stock', ascending: false, label: 'Остаток: сначала больше' },
  { value: 'stock-asc', key: 'stock', ascending: true, label: 'Остаток: сначала меньше' },
]

function OfferRows({ offers }) {
  const viewport = useRef(null)
  const [sort, setSort] = useState(null)
  const rows = useMemo(() => {
    if (!sort) return offers
    return [...offers].sort((left, right) => {
      const a = left[sort.key]
      const b = right[sort.key]
      if (a == null || b == null) return Number(a == null) - Number(b == null)
      return sort.ascending ? a - b : b - a
    })
  }, [offers, sort])
  const getItemKey = useCallback(index => rows[index].id, [rows])
  const virtual = useVirtualizer({
    count: rows.length,
    getScrollElement: () => viewport.current,
    estimateSize: () => 82,
    getItemKey,
    overscan: 5,
  })
  useLayoutEffect(() => {
    virtual.scrollToOffset(0)
  }, [sort, virtual])

  function sortHeader(key, label) {
    const current = sort?.key === key
    const Icon = current ? (sort.ascending ? ArrowUp : ArrowDown) : ArrowDownUp
    function toggle() {
      setSort({ key, ascending: current ? !sort.ascending : key === 'price' })
    }
    return <div role="columnheader" aria-sort={current ? (sort.ascending ? 'ascending' : 'descending') : 'none'}>
      <span className="mobile-column-label">{label}</span>
      <button onClick={toggle} className="sort-control">{label}<Icon size={13} aria-hidden="true" /></button>
    </div>
  }
  return (
    <>
    <label className="mobile-sort">Сортировка
      <select value={sort ? `${sort.key}-${sort.ascending ? 'asc' : 'desc'}` : ''}
        onChange={event => setSort(sortOptions.find(option => option.value === event.target.value) ?? null)}>
        <option value="">Исходный порядок</option>
        {sortOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
    <div className="offers-table" role="table" aria-labelledby="offers-title"
      aria-rowcount={rows.length + 1} aria-colcount={4}>
      <div className="offers-heading offers-grid" role="row" aria-rowindex={1}>
        <div role="columnheader">Деталь</div>
        <div role="columnheader">Склад</div>
        {sortHeader('stock', 'Остаток')}
        {sortHeader('price', 'Цена')}
      </div>
      <div className="offers-viewport" ref={viewport} tabIndex={0} role="rowgroup" aria-label="Строки предложений">
        <div role="presentation" style={{ height: virtual.getTotalSize(), position: 'relative' }}>
          {virtual.getVirtualItems().map(item => {
            const row = rows[item.index]
            return <div className="offer-row offers-grid" role="row" key={item.key} data-index={item.index}
              aria-rowindex={item.index + 2} ref={virtual.measureElement}
              style={{ transform: 'translateY(' + item.start + 'px)' }}>
              <div role="cell" className="offer-detail">
                <strong>{row.name}</strong>
                <span>{row.brand} · <span className="part-number">{row.number}</span></span>
                {row.isOriginal && <small>Искомая деталь</small>}
              </div>
              <div role="cell" className="offer-warehouse">{row.warehouse || '—'}</div>
              <div role="cell" className={'offer-stock' + (row.stock > 0 ? ' available' : '')}>
                {row.stock == null ? '—' : quantity.format(row.stock) + ' шт.'}
              </div>
              <div role="cell" className="offer-price">{row.price == null ? '—' : currency.format(row.price)}</div>
            </div>
          })}
        </div>
      </div>
    </div>
    </>
  )
}

export default function OffersTable({ offers, status, error, onRetry }) {
  if (status === 'loading') return <PanelState loading title="Загружаем предложения…" />
  if (status === 'error') return <PanelState error title="Не удалось загрузить предложения" description={error} onRetry={onRetry} />
  if (status === 'idle') return <PanelState icon={PackageSearch} title="Выберите производителя" description="Покажем исходную деталь и её аналоги, цены и остатки на складах." />
  if (!offers.length) return <PanelState icon={PackageSearch} title="Предложений пока нет" description="Попробуйте выбрать другого производителя." />
  return <OfferRows offers={offers} />
}
