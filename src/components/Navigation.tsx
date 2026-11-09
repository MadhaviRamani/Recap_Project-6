import { NavLink } from "react-router";

export default function Navigation() {
  return (
    <nav aria-label="Main">
      {/* end: without it, the link to / would be active on every page */}
      <NavLink to="/" end>
        Spotlight
      </NavLink>
      <NavLink to="/art-pieces">Gallery</NavLink>
    </nav>
  );
}
