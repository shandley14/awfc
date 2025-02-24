import { footHeaders, getApi } from './apiCallMethods';

export const getLeagues = async (_opts?: object) => {
    const options = { ..._opts, headers: footHeaders };
    const data = await getApi('leagues', options);

    if (!data || !data.response) {
        console.error("Error fetching leagues:", data);
        return [];
    }

    const manualIds = [44, 82, 1130, 1117, 904]; // ✅ Manually added league IDs

    // ✅ Filter leagues that contain "Women" in their name OR are in manualIds
    const filteredLeagues = data.response.filter((league: any) => {
    const name = league.league.name.toLowerCase();

    // ✅ Match any variation that contains "fem"
    const femenRegex = /fem/; 

    return femenRegex.test(name) || name.includes("women") || manualIds.includes(league.league.id);
});

    // ✅ Sort leagues alphabetically
    return filteredLeagues.sort((a, b) => a.league.name.localeCompare(b.league.name));
};


export const getFixtures = async (_opts: {
  headers: {}; params?: { season?: number; date?: string; league?: number; timezone?: string } 
}) => {
    try {
      // Remove the "params" property so it doesn't get appended automatically.
      const { params, ...restOpts } = _opts || {};
      const { season, date, league, timezone } = params || {};
  
      // Ensure the date is in YYYY-MM-DD format.
      const formattedDate = date ? new Date(date).toISOString().split('T')[0] : '';


  
      // Build the query string.
      let query = `season=${season}&date=${formattedDate}`;
      if (league) query += `&league=${league}`;
      if (timezone) query += `&timezone=${encodeURIComponent(timezone)}`;
  
      // Merge custom headers with your footHeaders.
      const options = {
        ...restOpts, // does NOT include params anymore
        headers: { ...footHeaders, ...(_opts.headers || {}) },
      };
  
      // Call the API using getApi with the query string.
      const data = await getApi(`fixtures?${query}`, options);
      return data;
    } catch (error) {
      console.error("Error fetching fixtures:", error);
      return null;
    }
};
  

export const getStandings = async (_opts?: object) => {
    const options = {..._opts, headers: footHeaders}
    const data = await getApi('standings', options);
    return data
}

export const getPlayers = async (_opts?: object) => {
    const options = {..._opts, headers: footHeaders}
    const data = await getApi('players', options);
    return data
}

export const getSquad = async (_opts?: object) => {
    const options = { ..._opts, headers: footHeaders };
    const data = await getApi("players/squads", options); // ✅ Correct API endpoint

    console.log("Raw Player Data:", data); // ✅ Debugging API response

    if (!data || !data.response || !Array.isArray(data.response)) {
        console.error("Error: Invalid player squad response", data);
        return []; // ✅ Return empty array if response is invalid
    }

    return data.response[0]?.players || []; // ✅ Ensure correct data structure
};

export const getTeams = async (_opts?: object) => {
    const options = {..._opts, headers: footHeaders}
    const data = await getApi('teams', options);
    return data
}

export const getFixtureById = async (id) => {
    try {
      const opts = {
        headers: { ...footHeaders, "Content-Type": "application/json" }
      };
      const data = await getApi(`fixtures?id=${id}`, opts);
      return data;
    } catch (error) {
      console.error(`Error fetching fixture with id ${id}:`, error);
      return null;
    }
  };