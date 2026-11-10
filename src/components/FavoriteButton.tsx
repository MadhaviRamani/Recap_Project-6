import "./FavoriteButton.css";

type FavoriteButtonProps = {
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export default function FavoriteButton({
  isFavorite,
  onToggleFavorite,
}: FavoriteButtonProps) {
  return (
    <button
      type="button"
      className="favorite-button"
      aria-label="Favorite"
      aria-pressed={isFavorite}
      onClick={onToggleFavorite}
    >
      {/* a little brass picture lamp, like the lamps in the gallery hallway:
          off it is only an outline, on (favorite) its shade is filled and it
          shines a cone of light */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* the arm that holds the lamp */}
        <path d="M12 2v4" fill="none" />
        {/* the rounded lamp shade and the bulb under it */}
        <path d="M4.5 12a7.5 6 0 0 1 15 0Z" />
        <path d="M9.5 12a2.5 2 0 0 0 5 0" />
        {isFavorite && (
          <g className="favorite-lamp-light" fill="none">
            {/* the cone of light */}
            <path d="M8.5 15.5 6.5 20" />
            <path d="M12 16v5.5" />
            <path d="M15.5 15.5l2 4.5" />
            {/* a little four-pointed twinkle */}
            <path
              d="M20.5 14.2l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7Z"
              fill="currentColor"
              stroke="none"
            />
          </g>
        )}
      </svg>
    </button>
  );
}
