import { useState, type FormEvent } from "react";

import { cleanSearchText } from "../utils/cleanSearchText";
import "./SearchBar.css";

type SearchBarProps = {
  nationalities: string[];
  // nationality "" stands for all nationalities
  onSearch: (query: string, nationality: string) => void;
};

export default function SearchBar({ nationalities, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [nationality, setNationality] = useState("");
  const searchText = cleanSearchText(query);
  // there is only something to search with a text or a chosen nationality
  const canSearch = searchText !== "" || nationality !== "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSearch) {
      return;
    }
    onSearch(searchText, nationality);
    // the fields are cleared after each search; the list shows what was searched for
    setQuery("");
    setNationality("");
  }

  return (
    <form className="search-bar" role="search" onSubmit={handleSubmit}>
      <input
        type="search"
        aria-label="Search art pieces"
        value={query}
        placeholder="Name, artist or genre"
        onChange={(event) => setQuery(event.target.value)}
      />
      <select
        aria-label="Nationality"
        value={nationality}
        onChange={(event) => setNationality(event.target.value)}
      >
        <option value="">All nationalities</option>
        {nationalities.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      {/* only a magnifying glass is visible; the label gives the button its name */}
      <button type="submit" aria-label="Search" disabled={!canSearch}>
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
