import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type SubmitEvent,
} from "react";

import { cleanSearchText } from "../utils/cleanSearchText";
import "./SearchBar.css";

type SearchBarProps = {
  // the search that is active on the page; "" means no search
  query: string;
  onSearch: (query: string) => void;
  // ends the search, so all art pieces show again
  onShowAll: () => void;
};

// the search in the navigation: at first only the gold magnifying glass;
// a click opens the search field, the next click closes it; the search
// follows every letter typed; while a search is active, a clear button in the field
// shows all art pieces again
export default function SearchBar({
  query,
  onSearch,
  onShowAll,
}: SearchBarProps) {
  const [text, setText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchText = cleanSearchText(text);
  const isEmpty = searchText === "";

  // a click outside closes an empty search field
  useEffect(() => {
    if (!isOpen || !isEmpty) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!formRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, isEmpty]);

  // the opened field takes the focus, once it can be reached
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  function close() {
    setIsOpen(false);
    buttonRef.current?.focus();
  }

  // the search follows every letter typed; only extra spaces change nothing,
  // and an emptied field shows all art pieces again
  function handleChange(nextText: string) {
    setText(nextText);
    const nextSearchText = cleanSearchText(nextText);
    if (nextSearchText !== searchText) {
      onSearch(nextSearchText);
    }
  }

  // the search already runs while typing, so Enter does not reload the page
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" && isEmpty) {
      close();
    }
  }

  function handleShowAll() {
    onShowAll();
    setText("");
    close();
  }

  return (
    <form
      ref={formRef}
      className={`search-bar${isOpen ? " search-bar-open" : ""}`}
      role="search"
      onSubmit={handleSubmit}
    >
      {/* closed, the field is 0 wide and out of reach for the keyboard and
          screen readers */}
      <div className="search-bar-field" inert={!isOpen} aria-hidden={!isOpen}>
        <input
          ref={inputRef}
          id="search-input"
          type="search"
          // also for browsers without inert: Tab skips the closed field
          tabIndex={isOpen ? undefined : -1}
          aria-label="Search art pieces"
          value={text}
          placeholder="Name, artist or genre"
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        {query !== "" && (
          <button
            type="button"
            className="search-bar-clear"
            aria-label="Show all art pieces"
            tabIndex={isOpen ? undefined : -1}
            onClick={handleShowAll}
          >
            {/* x icon from Lucide (lucide.dev/icons/x) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>
      {/* only a magnifying glass is visible; it opens and closes the field;
          the label gives the button its name */}
      <button
        ref={buttonRef}
        type="button"
        className="search-bar-toggle"
        aria-label={isOpen ? "Close search" : "Open search"}
        aria-expanded={isOpen}
        aria-controls="search-input"
        onClick={() => setIsOpen((current) => !current)}
      >
        {/* search icon from Lucide (lucide.dev/icons/search) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    </form>
  );
}
