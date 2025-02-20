import { footHeaders, getApi } from './apiCallMethods';

export const getLeagues = async (_opts?: object) => {
    const options = { ..._opts, headers: footHeaders };
    const data = await getApi('leagues', options);

    if (!data || !data.response) {
        console.error("Error fetching leagues:", data);
        return [];
    }

    const manualIds = [44, 82]; // ✅ Manually added league IDs

    // ✅ Filter leagues that contain "Women" in their name OR are in manualIds
    const filteredLeagues = data.response.filter(
        (league: any) => 
            //league.league.name.toLowerCase().includes("women") || 
            manualIds.includes(league.league.id)
    );

    // ✅ Sort leagues alphabetically
    return filteredLeagues.sort((a, b) => a.league.name.localeCompare(b.league.name));
};


export const getFixtures = async (_opts = {}) => {
    try {
      // Remove the "params" property so it doesn't get appended automatically.
      const { params, ...restOpts } = _opts;
      const { season, date, league, timezone } = params || {};
  
      // Ensure the date is in YYYY-MM-DD format.
      const formattedDate =
        date instanceof Date ? date.toISOString().split('T')[0] : date;
  
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