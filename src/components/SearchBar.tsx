import { useState, type FormEvent } from "react";

type SearchBarProps = {
  nationalities: string[];
  // nationality "" stands for all nationalities
  onSearch: (query: string, nationality: string) => void;
};

export default function SearchBar({ nationalities, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [nationality, setNationality] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(query.trim(), nationality);
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
      <button type="submit">Search</button>
    </form>
  );
}
