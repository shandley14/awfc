import Link from 'next/link'
import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import Match from '../components/feed/Match'
import DateSlider from '../components/matches/DateSlider'
import LeagueSlider from '../components/matches/leagueSlider'
import { useApp } from '../components/constants/contexts/AppContext'
import LinearLoader from '../components/constants/LinearProgress'
import { getLeagues, getFixtures } from '../helpers/apiCalls'
import DatePicker from '../components/matches/DatePicker'
import MainLayout from '../components/layouts/MainLayout'
import { format, parseISO, isValid } from 'date-fns';

// ✅ Function to get today's date in the user's timezone
const getTodayInUserTimezone = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const Matches = () => {
    const { themeClass, setMobile } = useApp();
    const router = useRouter();
    const [fixtures, setFixtures] = useState<any>([]);
    const [linear, setLinear] = useState<boolean>(false);

    // ✅ Initialize selectedDate (default to today if no URL param)
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        if (typeof window !== "undefined") {
            const urlDate = new URLSearchParams(window.location.search).get("date");
            if (urlDate) {
                const parsedDate = parseISO(urlDate);
                return isValid(parsedDate) ? parsedDate : getTodayInUserTimezone();
            }
        }
        return getTodayInUserTimezone();
    });

    // ✅ Ensure URL has `date` parameter when page loads
    useEffect(() => {
      if (!router.isReady) return; // ✅ Ensure query params are loaded before running effect
  
      const urlDate = router.query.date as string | undefined; // ✅ Explicitly treat as string
  
      if (typeof urlDate === "undefined") {
          // ✅ Only set today's date if `date` is completely missing from the URL
          const todayFormatted = format(getTodayInUserTimezone(), "yyyy-MM-dd");
          router.replace(`/?date=${todayFormatted}`, undefined, { shallow: true });
      } else {
          // ✅ Only update state if the `date` is valid and different from current state
          const queryDate = parseISO(urlDate);
          if (isValid(queryDate) && (!selectedDate || selectedDate.getTime() !== queryDate.getTime())) {
              setSelectedDate(queryDate);
          }
      }
  }, [router.isReady, router.query.date]);

    // ✅ Handle Date Change - Updates both state and URL
    const handleDateChange = (newDate: Date | string) => {
      const parsedDate = typeof newDate === "string" ? new Date(newDate + "T00:00:00") : newDate;
      if (!parsedDate || isNaN(parsedDate.getTime())) return;
  
      const formattedDate = format(parsedDate, "yyyy-MM-dd");
  
      // ✅ Update the URL only if the date actually changes
      if (router.query.date !== formattedDate) {
          router.push(`/?date=${formattedDate}`, undefined, { shallow: true });
      }
  
      setSelectedDate(parsedDate);
  };

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
        if (!selectedDate || !isValid(selectedDate)) return;

        const leagues = await getLeagues();
        if (!leagues || leagues.length === 0) return;

        let allFixtures: any[] = [];
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        for (const leagueObj of leagues) {
            const leagueId = leagueObj.league.id;
            const leagueSeason = determineLeagueSeason(leagueObj, selectedDate);
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

    useEffect(() => {
        getFixByLeague();
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
                            <DateSlider date={selectedDate} setDate={handleDateChange} />
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
