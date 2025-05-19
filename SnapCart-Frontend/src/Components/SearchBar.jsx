import { useState, useMemo } from "react";
import { GoSearch } from "react-icons/go";

const SearchBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandInput, setExpandInput] = useState(false);
  const [expandMobileInput, setExpandMobileInput] = useState(false);

  const handleSearchFocus = () => setExpandInput(true);
  const handleSearchBlur = () => setExpandInput(false);
  const handleMobileSearchBlur = () => {
    setExpandMobileInput(false);
    setTimeout(() => setIsSearchOpen(false), 200);
  };

  const toggleMobileSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        const inputElement = document.getElementById('mobileSearchInput');
        if (inputElement) inputElement.focus();
      }, 100);
    }
  };

  const styles = useMemo(
    () => ({
      inputStyles: (expand) =>
        `block border border-slate-300 dark:border-slate-600 text-sm py-2 px-5 rounded-lg focus:outline-none focus:border-blue-400 shadow-sm focus:shadow-md bg-gray-100 dark:bg-slate-700 dark:text-white tracking-wider transition-all duration-300 ease-in-out ${
          expand ? "w-[30vw]" : "w-[25vw]"
        }`,
      mobileInputStyles: (expand) =>
        `block w-full border border-slate-300 dark:border-slate-600 text-sm py-2 px-5 rounded-lg focus:outline-none focus:border-blue-400 shadow-sm focus:shadow-md bg-gray-100 dark:bg-slate-800 dark:text-white tracking-widest transition-all duration-300 ease-in-out ${
          expand ? "h-9" : "h-7"
        }`,
    }),
    []
  );

  return (
    <>
      {/* Desktop Search Bar - Hidden on small screens */}
      <div className="hidden lg:flex items-center relative">
        <input
          type="text"
          placeholder="What are you looking for?"
          className={styles.inputStyles(expandInput)}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
        />
        <GoSearch className="absolute right-4 text-gray-400 cursor-pointer text-xl hover:text-white" />
      </div>

      {/* Mobile Search Icon - Visible only on small screens */}
      <button 
        className="lg:hidden text-xl text-black/60 dark:text-white/80 hover:text-black dark:hover:text-white"
        onClick={toggleMobileSearch}
      >
        <GoSearch />
      </button>

      {/* Mobile Search Modal */}
      {isSearchOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40 flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-lg p-4 shadow-lg">
            <div className="relative">
              <input
                id="mobileSearchInput"
                type="text"
                placeholder="Search products..."
                className={styles.mobileInputStyles(expandMobileInput)}
                onFocus={() => setExpandMobileInput(true)}
                onBlur={handleMobileSearchBlur}
                autoFocus
              />
              <GoSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer text-xl hover:text-white" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;