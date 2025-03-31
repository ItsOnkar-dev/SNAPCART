import { useState, useMemo } from "react";
import { GoSearch } from "react-icons/go";

const SearchBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandInput, setExpandInput] = useState(false);
  const [expandMobileInput, setExpandMobileInput] = useState(false);

  const handleSearchFocus = () => setExpandInput(true);
  const handleSearchBlur = () => setExpandInput(false);
  const handleMobileSearchFocus = () => setExpandMobileInput(true);
  const handleMobileSearchBlur = () => setExpandMobileInput(false);

  const toggleMobileSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    // Reset mobile input expansion state when closing
    if (isSearchOpen) {
      setExpandMobileInput(false);
    }
  };

  const styles = useMemo(
    () => ({
      inputStyles: (expand) =>
        `block border border-slate-300 dark:border-slate-600 text-sm py-1.5 px-5 rounded-lg focus:outline-none focus:border-blue-400 shadow-sm focus:shadow-md bg-gray-100 dark:bg-slate-700 dark:text-white tracking-widest transition-all duration-300 ease-in-out ${
          expand ? "w-[45vw] lg:w-[25vw]" : "w-[40vw] lg:w-[20vw]"
        }`,
      mobileInputStyles: (expand) =>
        `block w-full border border-slate-300 dark:border-slate-600 text-sm py-2 px-5 rounded-lg focus:outline-none focus:border-blue-400 shadow-sm focus:shadow-md bg-gray-100 dark:bg-slate-700 dark:text-white tracking-widest transition-all duration-300 ease-in-out ${
          expand ? "h-10" : "h-8"
        }`,
    }),
    []
  );

  return (
    <>
      {/* Desktop Search Bar */}
      <div className="hidden sm:flex items-center relative">
        <input
          type="text"
          placeholder="What are you looking for?"
          className={styles.inputStyles(expandInput)}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
        />
        <GoSearch className="absolute right-3 text-lg text-slate-500 cursor-pointer" />
      </div>

      {/* Mobile Search Icon */}
      <button className="sm:hidden" onClick={toggleMobileSearch}>
        <GoSearch className="text-xl text-slate-500 dark:text-slate-300 dark:hover:text-white hover:text-black" />
      </button>

      {/* Mobile Search Bar Container */}
      <div 
        className={`absolute left-0 right-0 px-4 bg-white dark:bg-[rgb(15,23,42)] transition-all duration-300 z-20 lg:hidden ${
          isSearchOpen 
            ? "top-full opacity-100 h-16 border-b border-gray-200 dark:border-slate-800" 
            : "top-[-100%] opacity-0 h-0"
        }`}
      >
        <div className="relative py-2">
          <input
            type="text"
            placeholder="What are you looking for?"
            className={styles.mobileInputStyles(expandMobileInput)}
            onFocus={handleMobileSearchFocus}
            onBlur={handleMobileSearchBlur}
          />
          <GoSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-lg text-slate-500" />
        </div>
      </div>
    </>
  );
};

export default SearchBar;