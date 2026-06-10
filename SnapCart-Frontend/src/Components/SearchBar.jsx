import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoSearch } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import useProductContext from "../context/Product/useProductContext";
import useDebounce from "../hooks/useDebounce";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandInput, setExpandInput] = useState(false);
  const [expandMobileInput, setExpandMobileInput] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const mobileInputRef = useRef(null);
  const desktopInputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const { searchResults, searchLoading, searchProducts, clearSearch } =
    useProductContext();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      searchProducts({ q: debouncedQuery, suggest: true, limit: 6 });
      setShowSuggestions(true);
    } else {
      clearSearch();
      setShowSuggestions(false);
    }
  }, [debouncedQuery, searchProducts, clearSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateToSearch = useCallback(
    (searchQuery) => {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;
      setShowSuggestions(false);
      setIsSearchOpen(false);
      setQuery("");
      clearSearch();
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [navigate, clearSearch]
  );

  const navigateToProduct = useCallback(
    (productId) => {
      setShowSuggestions(false);
      setIsSearchOpen(false);
      setQuery("");
      clearSearch();
      navigate(`/products/${productId}`);
    },
    [navigate, clearSearch]
  );

  const handleKeyDown = (e) => {
    if (!showSuggestions || searchResults.length === 0) {
      if (e.key === "Enter") navigateToSearch(query);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && searchResults[activeIndex]) {
        navigateToProduct(searchResults[activeIndex]._id);
      } else {
        navigateToSearch(query);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const handleSearchFocus = () => {
    setExpandInput(true);
    if (query.trim().length >= 2) setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    setExpandInput(false);
  };

  const handleMobileSearchBlur = () => {
    setExpandMobileInput(false);
    setTimeout(() => {
      setIsSearchOpen(false);
      setShowSuggestions(false);
    }, 200);
  };

  const toggleMobileSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 100);
    } else {
      setQuery("");
      clearSearch();
    }
  };

  const styles = useMemo(
    () => ({
      inputStyles: (expand) =>
        `block border border-slate-300 dark:border-slate-600 text-sm py-2 pl-5 pr-10 rounded-lg focus:outline-none focus:border-blue-400 shadow-sm focus:shadow-md bg-gray-100 dark:bg-slate-700 dark:text-white tracking-wider transition-all duration-300 ease-in-out ${
          expand ? "w-[30vw]" : "w-[25vw]"
        }`,
      mobileInputStyles: (expand) =>
        `block w-full border border-slate-300 dark:border-slate-600 text-sm py-2 pl-5 pr-10 rounded-lg focus:outline-none focus:border-blue-400 shadow-sm focus:shadow-md bg-gray-100 dark:bg-slate-800 dark:text-white tracking-widest transition-all duration-300 ease-in-out ${
          expand ? "h-9" : "h-7"
        }`,
    }),
    []
  );

  const SuggestionsDropdown = ({ className = "" }) => {
    if (!showSuggestions || query.trim().length < 2) return null;

    return (
      <div
        className={`absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl z-50 overflow-hidden ${className}`}
      >
        {searchLoading && (
          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
            Searching...
          </div>
        )}

        {!searchLoading && searchResults.length === 0 && (
          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
            No products found for &quot;{query}&quot;
          </div>
        )}

        {!searchLoading && searchResults.length > 0 && (
          <ul>
            {searchResults.map((product, index) => (
              <li key={product._id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => navigateToProduct(product._id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors ${
                    index === activeIndex
                      ? "bg-blue-50 dark:bg-slate-700"
                      : ""
                  }`}
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {product.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {product.description}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">
                    ₹{product.price}
                  </span>
                </button>
              </li>
            ))}
            <li className="border-t border-slate-200 dark:border-slate-600">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => navigateToSearch(query)}
                className="w-full px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 font-medium text-left"
              >
                View all results for &quot;{query}&quot;
              </button>
            </li>
          </ul>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        ref={containerRef}
        className="hidden xl:flex items-center relative"
      >
        <input
          ref={desktopInputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="What are you looking for?"
          className={styles.inputStyles(expandInput)}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
        />
        <button
          type="button"
          onClick={() => navigateToSearch(query)}
          className="absolute right-3 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          aria-label="Search"
        >
          <GoSearch className="text-xl" />
        </button>
        <SuggestionsDropdown />
      </div>

      <button
        type="button"
        className="xl:hidden text-xl text-black/60 dark:text-white/80 hover:text-black dark:hover:text-white"
        onClick={toggleMobileSearch}
        aria-label="Open search"
      >
        <GoSearch />
      </button>

      {isSearchOpen && (
        <div className="xl:hidden fixed inset-0 bg-black/50 z-40 flex items-start justify-center pt-20 px-4">
          <div
            ref={containerRef}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-lg p-4 shadow-lg relative"
          >
            <div className="relative">
              <input
                ref={mobileInputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search products..."
                className={styles.mobileInputStyles(expandMobileInput)}
                onFocus={() => setExpandMobileInput(true)}
                onBlur={handleMobileSearchBlur}
                autoFocus
              />
              <button
                type="button"
                onClick={() => navigateToSearch(query)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400"
                aria-label="Search"
              >
                <GoSearch className="text-xl" />
              </button>
            </div>
            <SuggestionsDropdown className="relative mt-2 shadow-none border-0" />
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;
