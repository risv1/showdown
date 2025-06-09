type ShowdownUserData = {
  username: string;
  userid: string;
  registertime: number;
};

export const fetchShowdownUserData = async (username: string): Promise<ShowdownUserData | null> => {
  try {
    const response = await fetch(`https://pokemonshowdown.com/users/${username}.json`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data as ShowdownUserData;
  } catch (error) {
    console.error("Error fetching Showdown user data:", error);
    return null;
  }
};

export const convertShowdownTimestamp = (timestamp: number): Date => {
  return new Date(timestamp * 1000);
};
