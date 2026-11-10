import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

import type { ArtPiece, ArtPieceInfo } from "../types";
import { isFavorite } from "../utils/artPiecesInfo";
import { splitIntoWalls } from "../utils/splitIntoWalls";
import ArtPiecePreview from "./ArtPiecePreview";
import HallwayFrontView from "./HallwayFrontView";
import "./Hallway.css";

// time to move the mouse from an art piece on a wall to its front view
// (or back) before the front view closes
export const FRONT_VIEW_CLOSE_DELAY = 150;

type HallwayProps = {
  artPieces: ArtPiece[];
  artPiecesInfo: ArtPieceInfo[];
  onToggleFavorite: (slug: string) => void;
};

type ItemProps = HTMLAttributes<HTMLLIElement> & { "data-slug": string };

type WallProps = HallwayProps & {
  side: "left" | "right" | "front";
  label: string;
  getItemProps: (slug: string) => ItemProps;
};

// the links and buttons the Tab key moves through, in their order
function getFocusables(element: Element | null | undefined): HTMLElement[] {
  return [
    ...(element?.querySelectorAll<HTMLElement>(
      'a[href]:not([tabindex="-1"]), button'
    ) ?? []),
  ];
}

function last(elements: HTMLElement[]): HTMLElement | undefined {
  return elements[elements.length - 1];
}

// one wall of the hallway; every art piece hangs under its own lamp
function Wall({
  side,
  label,
  artPieces,
  artPiecesInfo,
  onToggleFavorite,
  getItemProps,
}: WallProps) {
  return (
    <div className={`hallway-wall hallway-wall-${side}`}>
      {artPieces.length > 0 && (
        <ul className="hallway-wall-list" aria-label={label}>
          {artPieces.map((artPiece) => (
            <li
              key={artPiece.slug}
              className="hallway-item"
              {...getItemProps(artPiece.slug)}
            >
              {/* the royal lamp and its light are only decoration */}
              <span className="hallway-lamp" aria-hidden="true" />
              <span className="hallway-light" aria-hidden="true" />
              <ArtPiecePreview
                artPiece={artPiece}
                isFavorite={isFavorite(artPiecesInfo, artPiece.slug)}
                onToggleFavorite={onToggleFavorite}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// the gallery as a 3D hallway: 5 art pieces on the left wall,
// 5 on the right wall and the rest on the front wall; the art piece the
// user points at (or reaches with the keyboard) comes to the front
export default function Hallway({
  artPieces,
  artPiecesInfo,
  onToggleFavorite,
  runway,
}: HallwayProps & {
  // shown flat on the near end of the runway, e.g. the search bar
  runway?: ReactNode;
}) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  // a press with the mouse or a finger also focuses the link; only focus
  // from the keyboard opens the front view
  const isKeyboardUsed = useRef(true);
  // the focus that Escape puts back on the wall does not open it again
  const isReturningFocus = useRef(false);
  const hallwayRef = useRef<HTMLDivElement>(null);
  const frontViewRef = useRef<HTMLElement>(null);

  const walls = splitIntoWalls(artPieces);
  const wallProps = { artPiecesInfo, onToggleFavorite };
  const activeIndex = artPieces.findIndex(
    (artPiece) => artPiece.slug === activeSlug
  );
  const activeArtPiece = activeIndex === -1 ? null : artPieces[activeIndex];

  function getWallItem(slug: string) {
    return hallwayRef.current?.querySelector(`[data-slug="${slug}"]`);
  }

  function cancelClose() {
    window.clearTimeout(closeTimer.current);
  }

  function open(slug: string) {
    cancelClose();
    setActiveSlug(slug);
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = window.setTimeout(
      () => setActiveSlug(null),
      FRONT_VIEW_CLOSE_DELAY
    );
  }

  // the timer must not run after the hallway is gone
  useEffect(() => cancelClose, []);

  // remembers whether the keyboard or a pointer (mouse, finger) was used last
  useEffect(() => {
    function markKeyboardUsed() {
      isKeyboardUsed.current = true;
    }
    function markPointerUsed() {
      isKeyboardUsed.current = false;
    }

    document.addEventListener("keydown", markKeyboardUsed, true);
    document.addEventListener("pointerdown", markPointerUsed, true);
    return () => {
      document.removeEventListener("keydown", markKeyboardUsed, true);
      document.removeEventListener("pointerdown", markPointerUsed, true);
    };
  }, []);

  // Escape closes the front view; if the keyboard was in the hallway,
  // the focus goes back to the art piece on the wall
  useEffect(() => {
    if (activeSlug === null) {
      return;
    }
    const slug = activeSlug;

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }
      const hasFocus = hallwayRef.current?.contains(document.activeElement);
      cancelClose();
      setActiveSlug(null);
      if (hasFocus) {
        isReturningFocus.current = true;
        getFocusables(getWallItem(slug))[0]?.focus();
        isReturningFocus.current = false;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeSlug]);

  function getItemProps(slug: string): ItemProps {
    return {
      "data-slug": slug,
      // only a mouse opens the front view; a tap on a touch screen
      // opens the details page right away
      onPointerEnter: (event: PointerEvent) => {
        if (event.pointerType === "mouse") {
          open(slug);
        }
      },
      onPointerLeave: (event: PointerEvent) => {
        if (event.pointerType === "mouse") {
          scheduleClose();
        }
      },
      onFocus: () => {
        if (isKeyboardUsed.current && !isReturningFocus.current) {
          open(slug);
        }
      },
      // Tab after the last button of the art piece moves into its front view
      onKeyDown: (event: KeyboardEvent<HTMLLIElement>) => {
        const focusables = getFocusables(event.currentTarget);
        const frontViewFocusables = getFocusables(frontViewRef.current);
        if (
          event.key === "Tab" &&
          !event.shiftKey &&
          slug === activeSlug &&
          event.target === last(focusables) &&
          frontViewFocusables.length > 0
        ) {
          event.preventDefault();
          frontViewFocusables[0].focus();
        }
      },
    };
  }

  // Tab out of the front view goes on to the next art piece on the wall,
  // Shift+Tab goes back to the art piece the front view shows
  function handleFrontViewKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab" || activeSlug === null) {
      return;
    }
    const focusables = getFocusables(event.currentTarget);
    if (event.shiftKey && event.target === focusables[0]) {
      event.preventDefault();
      last(getFocusables(getWallItem(activeSlug)))?.focus();
    } else if (!event.shiftKey && event.target === last(focusables)) {
      const next = artPieces[activeIndex + 1];
      if (next) {
        event.preventDefault();
        getFocusables(getWallItem(next.slug))[0]?.focus();
      }
    }
  }

  // the front view closes when the keyboard leaves the hallway
  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      cancelClose();
      setActiveSlug(null);
    }
  }

  return (
    <div className="hallway" ref={hallwayRef} onBlur={handleBlur}>
      {/* outside the 3D room, so it stays flat and readable; first in the
          page, so the keyboard reaches it before the art pieces */}
      {runway && <div className="hallway-runway">{runway}</div>}
      <div className="hallway-room">
        <div className="hallway-ceiling" aria-hidden="true" />
        <div className="hallway-floor" aria-hidden="true" />
        <Wall
          side="left"
          label="Left wall"
          artPieces={walls.left}
          getItemProps={getItemProps}
          {...wallProps}
        />
        <Wall
          side="right"
          label="Right wall"
          artPieces={walls.right}
          getItemProps={getItemProps}
          {...wallProps}
        />
        <Wall
          side="front"
          label="Front wall"
          artPieces={walls.front}
          getItemProps={getItemProps}
          {...wallProps}
        />
      </div>
      {/* outside the 3D room, so it is flat and in front of the walls */}
      {activeArtPiece && (
        <HallwayFrontView
          ref={frontViewRef}
          artPiece={activeArtPiece}
          isFavorite={isFavorite(artPiecesInfo, activeArtPiece.slug)}
          onToggleFavorite={onToggleFavorite}
          onPointerEnter={cancelClose}
          onPointerLeave={scheduleClose}
          onKeyDown={handleFrontViewKeyDown}
        />
      )}
    </div>
  );
}
