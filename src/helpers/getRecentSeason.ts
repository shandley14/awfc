export const getRecentSeason = (league: any): number => {
  if (!league.seasons || league.seasons.length === 0) {
    console.log(`No seasons found for league ${league.league.id}, defaulting to current year.`);
    return new Date().getFullYear();
  }

  const today = new Date();

  // Find season where `current: true`
  const currentSeason = league.seasons.find((s: any) => s.current);
  if (currentSeason) {
    console.log(`Using current season for league ${league.league.id}: ${currentSeason.year}`);
    return currentSeason.year;
  }

  // Find the most recent season that has already ended
  const pastSeasons = league.seasons.filter((s: any) => new Date(s.end) < today);
  if (pastSeasons.length > 0) {
    const latestPastSeason = pastSeasons.reduce((latest: any, s: any) => 
      s.year > latest.year ? s : latest, pastSeasons[0]);
    
    console.log(`Using most recent past season for league ${league.league.id}: ${latestPastSeason.year}`);
    return latestPastSeason.year;
  }

  // If no past season is found, return the season with the highest year
  const maxYear = Math.max(...league.seasons.map((s: any) => s.year));
  console.log(`No active or past season found for league ${league.league.id}. Using max available year: ${maxYear}`);
  return maxYear;
};
