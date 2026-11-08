function validPart(item) {
  return typeof item?.brand === 'string' && item.brand.trim().length > 0
}

function numberOrNull(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return null
  if (typeof value === 'string' && !value.trim()) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function getBrands(goods) {
  const brands = new Map()
  for (const item of goods.filter(validPart)) {
    const brand = item.brand.trim()
    const key = brand.toUpperCase()
    if (!brands.has(key)) brands.set(key, brand)
  }
  return [...brands.values()].sort((a, b) => a.localeCompare(b, 'ru'))
}

function warehouseRows(part, index, isOriginal) {
  const base = {
    name: part.name?.trim() || 'Без названия',
    brand: part.brand.trim(),
    number: String(part.number ?? ''),
    isOriginal,
  }
  const prefix = `${isOriginal ? 'part' : 'analogue'}-${index}`
  const warehouses = Array.isArray(part.warehouses) ? part.warehouses.filter(Boolean) : []

  if (!warehouses.length) {
    // A total of zero establishes an empty stock; a positive total has no per-warehouse breakdown.
    return [{ ...base, id: prefix, warehouse: null, price: null, stock: numberOrNull(part.count) === 0 ? 0 : null }]
  }

  return warehouses.map((warehouse, position) => ({
    ...base,
    id: `${prefix}-${position}`,
    warehouse: warehouse.code || warehouse.id || null,
    price: numberOrNull(warehouse.price),
    stock: numberOrNull(warehouse.stock),
  }))
}

export function getOffers(goods) {
  const originals = goods.filter(validPart)
  const analogues = originals.flatMap((part) =>
    Array.isArray(part.analogues) ? part.analogues.filter(validPart) : [],
  )
  return [
    ...originals.flatMap((part, index) => warehouseRows(part, index, true)),
    ...analogues.flatMap((part, index) => warehouseRows(part, index, false)),
  ]
}
