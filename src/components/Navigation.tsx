import { Link, NavLink, useLocation } from "react-router";

import SearchBar from "./SearchBar";
import "./Navigation.css";

// the pages with a search bar in the navigation
const SEARCHABLE_PATHS = new Set(["/art-pieces", "/favorites"]);

type NavigationProps = {
  // the nationalities of the art pieces on the current page and the search
  // handler; without it, there is no search bar
  search?: {
    nationalities: string[];
    onSearch: (query: string, nationality: string) => void;
  };
};

export default function Navigation({ search }: NavigationProps) {
  const { pathname } = useLocation();
  const isSearchShown = search !== undefined && SEARCHABLE_PATHS.has(pathname);

  return (
    <nav className="navigation" aria-label="Main">
      <div className="navigation-inner">
        {/* a Link, not a NavLink: only the Spotlight text is highlighted on / */}
        <Link
          to="/"
          className="navigation-logo"
          aria-label="Art Gallery – Spotlight"
        >
          {/* a square monogram in a double gold frame: "M" top left and "R"
              bottom right, split by a fine diagonal line; "Art Gallery" is
              written under the square */}
          <svg
            className="navigation-logo-mark"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 40 40"
            aria-hidden="true"
          >
            <rect
              className="navigation-logo-frame"
              x="1"
              y="1"
              width="38"
              height="38"
              strokeWidth="1.5"
            />
            <rect
              className="navigation-logo-frame"
              x="4"
              y="4"
              width="32"
              height="32"
              strokeWidth="0.75"
            />
            <line
              className="navigation-logo-frame"
              x1="33"
              y1="7"
              x2="7"
              y2="33"
              strokeWidth="0.75"
            />
            <text x="13" y="19" className="navigation-logo-letter">
              M
            </text>
            <text x="27" y="31" className="navigation-logo-letter">
              R
            </text>
          </svg>
          <span className="navigation-logo-text" aria-hidden="true">
            Art Gallery
          </span>
        </Link>
        {/* between the logo and the links, so Tab reaches it right after the
            logo; the key gives every page a fresh, empty search bar */}
        {isSearchShown && (
          <SearchBar
            key={pathname}
            nationalities={search.nationalities}
            onSearch={search.onSearch}
          />
        )}
        <div className="navigation-links">
          {/* end: without it, the link to / would be active on every page */}
          <NavLink to="/" end>
            Spotlight
          </NavLink>
          <NavLink to="/art-pieces">Gallery</NavLink>
          <NavLink to="/favorites">Favorites</NavLink>
          {/* only an icon is visible; the label gives it its name for screen readers */}
          <NavLink
            to="/profile"
            className="navigation-profile"
            aria-label="Profile"
          >
            {/* user icon from Lucide (lucide.dev/icons/user) */}
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
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
