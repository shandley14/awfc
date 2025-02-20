import Link from 'next/link'
import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/router' // ✅ Added useRouter for URL management
import Match from '../components/feed/Match'
import DateSlider from '../components/matches/DateSlider'
import LeagueSlider from '../components/matches/leagueSlider'
import { useApp } from '../components/constants/contexts/AppContext'
import LinearLoader from '../components/constants/LinearProgress'
import { getLeagues, getFixtures } from '../helpers/apiCalls'
import date, { getCurrSeasonYear } from '../helpers/other'
import DatePicker from '../components/matches/DatePicker'
import MainLayout from '../components/layouts/MainLayout'
import { format } from 'date-fns';

const Matches = () => {
  const { themeClass, setMobile } = useApp();
  const router = useRouter(); // ✅ Added useRouter
  const [fixtures, setFixtures] = useState<any>([]);
  const [linear, setLinear] = useState<boolean>(false);

  // ✅ Use state for the selected date
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (typeof window !== "undefined") {
      const urlDate = new URLSearchParams(window.location.search).get("date");
      return urlDate ? new Date(urlDate + "T00:00:00") : date;
    }
    return date;
  });

  const handleDateChange = (newDate: Date | string) => {
    const parsedDate = typeof newDate === "string" ? new Date(newDate) : newDate;
    if (!parsedDate || isNaN(parsedDate.getTime())) return;

    const formattedDate = format(parsedDate, "yyyy-MM-dd");
    router.push(`/?date=${formattedDate}`, undefined, { shallow: true });

    setSelectedDate(parsedDate);
};

  // ✅ Sync state with the URL when the page loads
  useEffect(() => {
    if (router.query.date) {
      const queryDate = new Date(router.query.date + "T00:00:00");
      if (!isNaN(queryDate.getTime())) {
        setSelectedDate(queryDate);
      }
    }
  }, [router.query.date]);

  // ✅ Update URL when selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;

    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    // Prevent unnecessary URL updates
    if (router.query.date !== formattedDate) {
      router.replace(`/?date=${formattedDate}`, undefined, { shallow: true });
    }
  }, [selectedDate, router]);

  const determineLeagueSeason = (leagueObj: any, selected: Date) => {
    if (leagueObj.seasons && leagueObj.seasons.length > 0) {
      const currentSeasonObj = leagueObj.seasons.find((s: any) => s.current === true);
      if (currentSeasonObj) {
        const start = new Date(currentSeasonObj.start);
        const end = new Date(currentSeasonObj.end);
        if (selected >= start && selected <= end) return currentSeasonObj.year;
        if (selected < start) return currentSeasonObj.year - 1;
        if (selected > end) return currentSeasonObj.year + 1;
      }
    }
    return selected.getMonth() < 6 ? selected.getFullYear() - 1 : selected.getFullYear();
  };

  const getFixByLeague = async () => {
    const leagues = await getLeagues();
    if (!leagues || leagues.length === 0) return;

    let allFixtures: any[] = [];
    const formattedDate = format(new Date(selectedDate), "yyyy-MM-dd");
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    for (const leagueObj of leagues) {
      const leagueId = leagueObj.league.id;
      const leagueSeason = determineLeagueSeason(leagueObj, new Date(selectedDate));
      const opts = {
        params: { season: leagueSeason, date: formattedDate, league: leagueId, timezone },
        headers: { "Content-Type": "application/json" },
      };

      try {
        const data = await getFixtures(opts);
        if (data && data.response) {
          allFixtures = allFixtures.concat(data.response);
        }
      } catch (error) {
        console.error(`Error fetching fixtures for league ${leagueId}:`, error);
      }
    }

    setFixtures(allFixtures);
  };

  // ✅ Fetch fixtures when selectedDate updates
  useEffect(() => {
    if (selectedDate) {
      getFixByLeague();
    }
  }, [selectedDate]);

  // Group fixtures by league
  const groupedFixtures = useMemo(() => {
    return fixtures.reduce((acc: any, fixture: any) => {
      const leagueId = fixture.league.id;
      if (!acc[leagueId]) {
        acc[leagueId] = { league: fixture.league, fixtures: [] };
      }
      acc[leagueId].fixtures.push(fixture);
      return acc;
    }, {});
  }, [fixtures]);

  return (
    <MainLayout setLinear={setLinear} title={"matches"}>
      <div className={`flex flex-col min-h-[92vh] w-full ${themeClass.bg}`}>
        <LeagueSlider active={-1} setLinear={setLinear} />
        <div className="flex flex-col h-full justify-between w-full px-3">
          <div className={`${themeClass.border} w-full border-x-2 border-b-2`}>
            <div className="flex flex-col items-center">
              <p>Date</p>
              <DateSlider date={selectedDate} setDate={setSelectedDate} />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-lg mt-3 ml-3">Today's matches</h1>
              {fixtures?.length === 0 && <p className="mt-3 ml-3">No matches on this date</p>}
              <div className={`flex flex-col ${themeClass.bg} rounded-lg`}>
                {Object.values(groupedFixtures).map((group: any) => (
                  <div key={group.league.id}>
                    <h2 className="font-bold text-xl mt-3 ml-3">{group.league.name}</h2>
                    <div className="grid ltab:grid-cols-2 ltop:grid-cols-3 p-3 pt-0">
                      {group.fixtures.map((fix: any, index: any) => (
                        <Match key={index} fix={fix} setLinear={setLinear} />
                      ))}
                    </div>
                  </div>
                ))}
                <Link href="matches">
                  <p className="text-orange-600 mx-3 cursor-pointer hover:underline mb-2">See All Matches</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Matches;
