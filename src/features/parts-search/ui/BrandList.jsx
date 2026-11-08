import { useCallback, useId, useRef, useState } from 'react'
import { defaultRangeExtractor, useVirtualizer } from '@tanstack/react-virtual'
import { Check, ChevronRight, Factory } from 'lucide-react'
import PanelState from './PanelState.jsx'

function BrandOptions({ brands, selected, onSelect }) {
  const list = useRef(null)
  const id = useId()
  const [active, setActive] = useState(Math.max(0, brands.indexOf(selected)))
  const rangeExtractor = useCallback(range => (
    [...new Set([...defaultRangeExtractor(range), active])].sort((a, b) => a - b)
  ), [active])
  const getItemKey = useCallback(index => brands[index], [brands])
  const virtual = useVirtualizer({
    count: brands.length,
    getScrollElement: () => list.current,
    estimateSize: () => 48,
    getItemKey,
    overscan: 3,
    rangeExtractor,
  })
  function onKeyDown(event) {
    let target = active
    switch (event.key) {
      case 'ArrowDown': target = Math.min(active + 1, brands.length - 1); break
      case 'ArrowUp': target = Math.max(active - 1, 0); break
      case 'Home': target = 0; break
      case 'End': target = brands.length - 1; break
      case 'Enter':
      case ' ':
        event.preventDefault()
        onSelect(brands[active])
        return
      default: return
    }
    event.preventDefault()
    setActive(target)
    virtual.scrollToIndex(target, { align: 'auto' })
  }
  return (
    <div className="brand-options" id="brand-options" ref={list} role="listbox" aria-labelledby="brands-title"
      tabIndex={0} aria-activedescendant={id + active} onKeyDown={onKeyDown}>
      <div style={{ height: virtual.getTotalSize(), position: 'relative' }}>
        {virtual.getVirtualItems().map(item => {
          const name = brands[item.index]
          const chosen = name === selected
          return (
            <div key={item.key} id={id + item.index} role="option" aria-selected={chosen}
              aria-setsize={brands.length} aria-posinset={item.index + 1}
              className={'brand-option' + (active === item.index ? ' is-active' : '')}
              style={{ transform: 'translateY(' + item.start + 'px)' }}
              onClick={() => { list.current.focus({ preventScroll: true }); setActive(item.index); onSelect(name) }}>
              <span>{name}</span>
              {chosen ? <Check size={17} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function BrandList({ brands, status, error, selected, onSelect, onRetry, example, onExample }) {
  if (status === 'loading') return <PanelState loading title="Ищем производителей…" />
  if (status === 'error') return <PanelState error title="Ошибка поиска" description={error} onRetry={onRetry} />
  if (status === 'idle') return <PanelState icon={Factory} title="Введите артикул" description="Здесь появятся производители детали." />
  if (!brands.length && example) return <PanelState icon={Factory} title="Артикула нет в демокаталоге"
    description="Выберите один из демонстрационных артикулов.">
    <button type="button" className="retry-control" onClick={() => onExample(example)}>Показать пример {example}</button>
  </PanelState>
  if (!brands.length) return <PanelState icon={Factory} title="Производители не найдены" description="Проверьте артикул или попробуйте другой." />
  return <BrandOptions brands={brands} selected={selected} onSelect={onSelect} />
}
