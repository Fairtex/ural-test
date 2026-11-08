const analogueBrands = ['Febest', 'Lemförder', 'Mapco', 'MOOG', 'SWAG', 'TRW']
const warehouses = ['МС2', 'ЕКБ', 'СПБ', 'НСК', 'ОМС', 'КЗН', 'ПРМ', 'УФА']

function createPart(brand, number, name, index, warehouseCount) {
  const offers = warehouses.slice(0, warehouseCount).map((code, position) => ({
    code,
    price: 1253.6 + index * 12 + position * 35,
    stock: 1 + ((index * 3 + position) % 28),
  }))
  return {
    brand,
    number,
    name,
    count: offers.reduce((total, offer) => total + offer.stock, 0),
    warehouses: offers,
  }
}

// Deterministic, illustrative stock and prices. Both modes use the same response normalizer.
export function createDemoResponse(catalog, { number, brand }) {
  const article = number.trim().toUpperCase()
  const entry = catalog[article]
  if (!entry?.parts) return { goods: [{}] }

  const goods = Object.entries(entry.parts).flatMap(([manufacturer, name], i) => {
    if (brand && manufacturer !== brand) return []
    const part = createPart(manufacturer, article, name, i, entry.warehouseCount)
    if (brand) {
      part.analogues = Array.from({ length: entry.analogueCount }, (_, index) => {
        const variant = index + 1
        const sku = `${article}-${variant.toString().padStart(3, '0')}`
        // Include known parts without offers so the demo exercises the zero-stock case.
        const availableWarehouses = variant % 7 === 0 ? 0 : entry.warehouseCount
        return createPart(analogueBrands[index % analogueBrands.length], sku, name, variant, availableWarehouses)
      })
    }
    return [part]
  })
  return { goods }
}
