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
import { getRecentSeason } from '../helpers/getRecentSeason'

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
        if (!router.isReady) return;

        const urlDate = router.query.date as string | undefined;

        if (!urlDate) {
            const todayFormatted = format(getTodayInUserTimezone(), "yyyy-MM-dd");
            router.replace(`/?date=${todayFormatted}`, undefined, { shallow: true });
        } else {
            const queryDate = parseISO(urlDate);
            if (isValid(queryDate) && (!selectedDate || selectedDate.getTime() !== queryDate.getTime())) {
                setSelectedDate(queryDate);
                getFixByLeague(); // 🔥 Fetch fixtures when date is set
            }
        }
    }, [router.isReady, router.query.date]);


    // ✅ Handle Date Change - Updates both state and URL
    const handleDateChange: React.Dispatch<React.SetStateAction<string | Date>> = (newDate) => {
        // Resolve if `newDate` is a function
        const resolvedDate = typeof newDate === "function" ? newDate(selectedDate) : newDate;
    
        // Convert string to Date if needed
        const parsedDate = typeof resolvedDate === "string" ? new Date(resolvedDate + "T00:00:00") : resolvedDate;
    
        if (!parsedDate || isNaN(parsedDate.getTime())) return;
    
        const formattedDate = format(parsedDate, "yyyy-MM-dd");
        const queryLeague = router.query.league;
    
        let newUrl = `/?date=${formattedDate}`;
        if (queryLeague) {
            newUrl += `&league=${queryLeague}`;
        }
    
        if (router.query.date !== formattedDate) {
            router.push(newUrl, undefined, { shallow: true });
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

    // ✅ Modified to check for a league query param and only fetch that league if set
    const getFixByLeague = async () => {
        if (!selectedDate || !isValid(selectedDate)) return;

        const leagues = await getLeagues();
        if (!leagues || leagues.length === 0) return;

        const leagueQuery = router.query.league as string | undefined;
        let leaguesToFetch = leagues;

        if (leagueQuery) {
            const leagueIdQuery = parseInt(leagueQuery, 10);
            leaguesToFetch = leagues.filter((leagueObj: any) => leagueObj.league.id === leagueIdQuery);
        }

        let allFixtures: any[] = [];
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        for (const leagueObj of leaguesToFetch) {
            const leagueId = leagueObj.league.id;
            const leagueSeason = getRecentSeason(leagueObj);

            // 🔥 Skip leagues where the most recent season is not 2024 or 2025
            if (leagueSeason !== 2024 && leagueSeason !== 2025) {
                console.log(`Skipping league ${leagueId}: Season ${leagueSeason} is not 2024 or 2025.`);
                continue;
            }

            console.log(`Fetching fixtures for League ID ${leagueId}, Season ${leagueSeason}, Date ${formattedDate}`);

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


    // ✅ Added router.query.league to the dependency array to re-run when league changes
    useEffect(() => {
        if (!router.isReady || !selectedDate || !isValid(selectedDate)) return;
        getFixByLeague();
    }, [router.isReady, selectedDate, router.query.league]);


    // Group fixtures by country then league
    interface LeagueGroup {
        league: { id: number; name: string };
        fixtures: any[];
    }

    const groupedFixturesByCountry: Record<string, Record<number, LeagueGroup>> = useMemo(() => {
        return fixtures.reduce((acc: Record<string, Record<number, LeagueGroup>>, fixture: any) => {
            const country = fixture.league?.country || "Other";

            if (!acc[country]) {
                acc[country] = {};
            }

            const leagueId = fixture.league?.id || 0;

            if (!acc[country][leagueId]) {
                acc[country][leagueId] = { league: fixture.league, fixtures: [] };
            }

            acc[country][leagueId].fixtures.push(fixture);

            return acc;
        }, {});
    }, [fixtures]);


    return (
        <MainLayout setLinear={setLinear} title={"matches"}>
            <div className={`flex flex-col min-h-[92vh] w-full ${themeClass.bg}`}>
                <div className="flex flex-col h-full justify-between w-full px-3">
                    <div className={`${themeClass.border} w-full border-x-2 border-b-2`}>
                        <div className="flex flex-col items-center">
                            <DateSlider date={selectedDate} setDate={handleDateChange} />
                        </div>
                        <div className="flex flex-col">

                            {fixtures?.length === 0 && <p className="mt-3 ml-3">No matches on this date</p>}
                            <div className={`flex flex-col ${themeClass.bg} rounded-lg`}>
                                {Object.entries(groupedFixturesByCountry).map(([country, leagues]) => (
                                    <div key={country}>
                                        <h2 className="font-bold text-2xl mt-4 ml-3">{country}</h2>
                                        {leagues && typeof leagues === 'object' &&
                                            Object.values(leagues).map((group: LeagueGroup) => (
                                                <div key={group.league.id}>
                                                    <h3 className="font-bold text-xl mt-3 ml-3">{group.league.name}</h3>
                                                    <div className="grid ltab:grid-cols-2 ltop:grid-cols-3 p-3 pt-0">
                                                        {group.fixtures.map((fix: any, index: number) => (
                                                            <Match key={index} fix={fix} setLinear={setLinear} />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Matches;
