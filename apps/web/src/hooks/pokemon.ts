import { useCallback } from "react";

export interface PokemonNameUtils {
  formatForSprite: (name: string) => string;
  formatForDisplay: (name: string) => string;
  isValidPokemonName: (name: string) => boolean;
}

export const usePokemon = (): PokemonNameUtils => {
  const formatForSprite = useCallback((name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }, []);

  const formatForDisplay = useCallback((name: string): string => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }, []);

  const isValidPokemonName = useCallback((name: string): boolean => {
    return name.trim().length > 0 && /^[a-zA-Z0-9\s-]+$/.test(name.trim());
  }, []);

  return {
    formatForSprite,
    formatForDisplay,
    isValidPokemonName,
  };
};
