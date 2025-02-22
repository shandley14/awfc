import { useEffect, useState } from 'react';
import { useApp } from '../components/constants/contexts/AppContext';
import LinearLoader from '../components/constants/LinearProgress';
import { getFixtures, getStandings } from '../helpers/apiCalls';
import date, { getCurrSeasonYear } from '../helpers/other';
import Match from '../components/feed/Match';
import Standings from '../components/leagues/Standings';
import NavBar from '../components/constants/NavBar';
import SideBar from '../components/constants/SideBar';
import Image from 'next/image';
import Link from 'next/link';

const DEFAULT_LEAGUE_ID = '39'; // Default to EPL, change later if needed

const Feed = ({ leagueId }: { leagueId?: string }) => {
  const { themeClass, setMobile } = useApp();
  const [linear, setLinear] = useState(false);
  const [fixtures, setFixtures] = useState([]);
  const [standings, setStandings] = useState<any>(null);

  const currentLeague = leagueId || DEFAULT_LEAGUE_ID; // Use provided ID or fallback

  const fetchFixtures = async () => {
    const opts = {
      params: { season: getCurrSeasonYear(), league: currentLeague, date: date },
      headers: { 'Content-Type': 'application/json' }
    };
    const data = await getFixtures(opts);
    setFixtures(data.response);
  };

  const fetchStandings = async () => {
    const opts = {
      params: { season: getCurrSeasonYear(), league: currentLeague },
      headers: { 'Content-Type': 'application/json' }
    };
    const data = await getStandings(opts);
    setStandings(data.response?.[0]);
  };

  useEffect(() => {
    fetchFixtures();
    fetchStandings();
  }, [currentLeague]); // Re-fetch when league changes

  // Derive league name either from standings or from the first fixture
  const leagueName =
    standings?.league?.name || fixtures?.[0]?.league?.name || 'League';

  return (
    <div className={`flex flex-col ${themeClass.bg} w-full h-screen overflow-hidden`}>
      {linear && <LinearLoader />}
      <NavBar />
      <div className="flex">
        <div
          onClick={() => setMobile(false)}
          className={`flex ${themeClass.bgAlt} ${themeClass.text} flex-col px-3 pt-1 w-full h-[92vh] overflow-y-auto`}
        >
          <div className="flex flex-col">
            <h1 className="font-bold text-lg mt-3 ml-3">{leagueName} Fixtures</h1>
            <div className={`flex flex-col ${themeClass.bg} rounded-lg`}>
              <div className={`grid ltab:grid-cols-2 xtab:grid-cols-3 pb-3 phone:px-3 pt-0`}>
                {fixtures.map((fix: any, index) => (
                  <Match key={index} fix={fix} setLinear={setLinear} />
                ))}
              </div>
              <Link href="/matches">
                <p className="text-orange-600 mx-3 cursor-pointer hover:underline mb-2">
                  See All Matches
                </p>
              </Link>
            </div>
            <Standings data={standings?.league?.standings[0]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
