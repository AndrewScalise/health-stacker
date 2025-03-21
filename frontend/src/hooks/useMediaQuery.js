import { useState, useEffect } from "react";

/**
 * Custom hook to determine if the current screen matches a media query
 * @param {string} query - Media query string
 * @returns {boolean} Whether the media query matches
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create media query list and check initial match
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    // Define listener function
    const listener = (event) => {
      setMatches(event.matches);
    };

    // Add listener for changes
    mediaQuery.addEventListener("change", listener);

    // Clean up listener on unmount
    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  }, [query]);

  return matches;
};
