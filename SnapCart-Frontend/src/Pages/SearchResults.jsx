import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GoSearch } from "react-icons/go";
import ProductCard from "../Components/Products/ProductCard";
import useProductContext from "../context/Product/useProductContext";
import useDebounce from "../hooks/useDebounce";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { searchResults, searchLoading, searchError, searchMeta, searchProducts } =
    useProductContext();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "relevance");
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );

  const debouncedQuery = useDebounce(query, 400);
  const debouncedMinPrice = useDebounce(minPrice, 400);
  const debouncedMaxPrice = useDebounce(maxPrice, 400);

  const updateUrl = useCallback(
    (params) => {
      const next = new URLSearchParams();
      if (params.q) next.set("q", params.q);
      if (params.minPrice) next.set("minPrice", params.minPrice);
      if (params.maxPrice) next.set("maxPrice", params.maxPrice);
      if (params.sort && params.sort !== "relevance") next.set("sort", params.sort);
      if (params.page && params.page > 1) next.set("page", String(params.page));
      setSearchParams(next, { replace: true });
    },
    [setSearchParams]
  );

  useEffect(() => {
    const params = {
      q: debouncedQuery,
      minPrice: debouncedMinPrice,
      maxPrice: debouncedMaxPrice,
      sort,
      page,
      limit: 20,
    };
    updateUrl(params);
    searchProducts(params);
  }, [
    debouncedQuery,
    debouncedMinPrice,
    debouncedMaxPrice,
    sort,
    page,
    searchProducts,
    updateUrl,
  ]);

  const handleQueryChange = (value) => {
    setQuery(value);
    setPage(1);
  };

  const handleMinPriceChange = (value) => {
    setMinPrice(value);
    setPage(1);
  };

  const handleMaxPriceChange = (value) => {
    setMaxPrice(value);
    setPage(1);
  };

  const handleSortChange = (value) => {
    setSort(value);
    setPage(1);
  };

  const pagination = searchMeta?.pagination;
  const totalResults = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 0;

  const handleClearFilters = () => {
    setQuery("");
    setMinPrice("");
    setMaxPrice("");
    setSort("relevance");
    setPage(1);
    navigate("/search");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Search Products
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find exactly what you need with live search and advanced filters
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 md:p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 relative">
            <GoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => handleMinPriceChange(e.target.value)}
              placeholder="Min price (₹)"
              min="0"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
              placeholder="Max price (₹)"
              min="0"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="sort"
              className="text-sm text-gray-600 dark:text-gray-400"
            >
              Sort by:
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {(query || minPrice || maxPrice || sort !== "relevance") && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        {searchLoading ? (
          <p className="text-gray-500 dark:text-gray-400">Searching...</p>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">
            {debouncedQuery ? (
              <>
                <span className="font-semibold">{totalResults}</span> result
                {totalResults !== 1 ? "s" : ""} for &quot;
                <span className="font-semibold">{debouncedQuery}</span>&quot;
              </>
            ) : (
              <>
                Showing <span className="font-semibold">{totalResults}</span>{" "}
                product{totalResults !== 1 ? "s" : ""}
              </>
            )}
          </p>
        )}
      </div>

      {searchLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400" />
        </div>
      )}

      {searchError && !searchLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500 text-center">
            <p className="text-xl mb-2">Search Error</p>
            <p>{searchError}</p>
          </div>
        </div>
      )}

      {!searchLoading && !searchError && searchResults.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <GoSearch className="text-5xl text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-xl mb-2">
            No products found
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}

      {!searchLoading && !searchError && searchResults.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {searchResults.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400 px-3">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default SearchResults;
