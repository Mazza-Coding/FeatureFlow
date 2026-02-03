import React, { useState, useEffect } from "react";

const SearchInput = ({
  placeholder = "Search...",
  value,
  onChange,
  debounceMs = 300,
}) => {
  const [localValue, setLocalValue] = useState(value || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onChange && localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs]);

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleClear = () => {
    setLocalValue("");
    onChange?.("");
  };

  return (
    <div className="search-input-container">
      <span className="search-input-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
      {localValue && (
        <button
          type="button"
          className="search-input-clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SearchInput;
