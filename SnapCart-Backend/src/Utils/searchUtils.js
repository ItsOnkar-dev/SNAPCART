const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const SORT_OPTIONS = {
  relevance: { createdAt: -1 },
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
}

export const parseSearchParams = (query) => {
  const q = (query.q || '').trim()
  const minPrice = query.minPrice ? Number(query.minPrice) : null
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : null
  const sort = SORT_OPTIONS[query.sort] ? query.sort : 'relevance'
  const page = Math.max(1, parseInt(query.page, 10) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20))
  const suggest = query.suggest === 'true'

  return { q, minPrice, maxPrice, sort, page, limit, suggest }
}

export const buildProductSearchFilter = ({ q, minPrice, maxPrice }) => {
  const filter = {}

  if (q) {
    // Utilize MongoDB Text Index for full-text searches to run indexed scans.
    // Fall back to regex for short queries (length <= 3) to support partial matching.
    if (q.length > 3) {
      filter.$text = { $search: q }
    } else {
      const escaped = escapeRegex(q)
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
      ]
    }
  }

  if (minPrice !== null && !Number.isNaN(minPrice)) {
    filter.price = { ...filter.price, $gte: minPrice }
  }

  if (maxPrice !== null && !Number.isNaN(maxPrice)) {
    filter.price = { ...filter.price, $lte: maxPrice }
  }

  return filter
}

export const getSortOption = (sort, hasQuery) => {
  if (sort === 'relevance' && !hasQuery) {
    return { createdAt: -1 }
  }
  return SORT_OPTIONS[sort] || SORT_OPTIONS.newest
}
