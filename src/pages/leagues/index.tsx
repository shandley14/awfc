import Link from "next/link";
import React, { useState, useEffect } from "react";
import Footer from "../../components/constants/Footer";
import { useApp } from "../../components/constants/contexts/AppContext";
import { getLeagues } from "../../helpers/apiCalls";
import LinearLoader from "../../components/constants/LinearProgress";
import Image from "next/image";
import MainLayout from "../../components/layouts/MainLayout";

// Helper function to determine the most recent season for a league
const getRecentSeason = (league: any): number => {
    if (league.seasons && league.seasons.length > 0) {
        // Try to find the season marked as current.
        const currentSeason = league.seasons.find((s: any) => s.current);
        console.log("current season", currentSeason);
        if (currentSeason) return currentSeason.year;

        // Otherwise, return the season with the highest year.
        return league.seasons.reduce(
            (max: number, season: any) => (season.year > max ? season.year : max),
            league.seasons[0].year
        );
    }
    // Fallback: return the current year.
    return new Date().getFullYear();
};

const Leagues = () => {
    const { themeClass } = useApp();
    const [leagueType, setLeagueType] = useState("League");
    const [leagues, setLeagues] = useState<any[]>([]);
    const [linear, setLinear] = useState<boolean>(true);

    useEffect(() => {
        const fetchLeagues = async () => {
            setLinear(true);
            try {
                const data = await getLeagues();
                console.log("API Response:", data);
                if (!data || !Array.isArray(data)) {
                    console.error("Error: API response is missing or invalid.");
                    setLeagues([]);
                    return;
                }
                setLeagues(data);
            } catch (error) {
                console.error("Error fetching leagues:", error);
                setLeagues([]);
            } finally {
                setLinear(false);
            }
        };

        fetchLeagues();
    }, []);

    // Handler to switch between League and Cup types.
    const handleLeagueTypeChange = (type: string) => {
        setLeagueType(type);
    };

    return (
        <MainLayout linear={linear} setLinear={setLinear}>
            <div className={`flex flex-col items-center min-h[92vh] p-2 w-full ${themeClass.bg}`}>
                <h2 className="text-center w-full font-semibold text-lg">
                    Leagues and Cups Information
                </h2>

                {/* Tabs for League vs Cup */}
                <div className="flex w-full relative items-center justify-center mt-3">
                    <div className={`absolute ${themeClass.border} top-0 left-0 h-full z-0 w-full border-b-2`} />
                    <div className={`flex items-center z-10 ${themeClass.bg}`}>
                        <div
                            onClick={() => handleLeagueTypeChange("League")}
                            className={`flex ${leagueType === "League" ? "border-x-2 border-t-2" : "border-b-2 border-t-2 border-t-transparent"}
                cursor-pointer ${themeClass.border} py-2 px-3 items-center`}
                        >
                            <p className="font-semibold conc w-full">Leagues</p>
                        </div>
                        <div
                            onClick={() => handleLeagueTypeChange("Cup")}
                            className={`flex ${leagueType === "Cup" ? "border-x-2 border-t-2" : "border-b-2 border-t-2 border-t-transparent"}
                cursor-pointer py-2 px-3 items-center ${themeClass.border}`}
                        >
                            <p className="font-semibold conc w-full">Cups</p>
                        </div>
                    </div>
                </div>

                {/* Leagues Grid */}
                <div className="flex flex-col min-h-[78.5vh] justify-between w-full h-full">
                    <div className={`w-full ${themeClass.border} h-full border-x-2 border-b-2`}>
                        {linear ? (
                            <LinearLoader /> // Show loading indicator
                        ) : (
                            <div className={`grid mt-3 desktop:grid-cols-4 xtab:grid-cols-3 phone:grid-cols-2 gap-3 p-3 pt-0`}>
                                {leagues
                                    .filter((league) => league.league.type === leagueType)
                                    .map((league, i) => {
                                        // Pass the full league object, not just league.league
                                        const recentSeason = getRecentSeason(league);
                                        return (
                                            <Link
                                                href={`/leagues/${league.league.id}?season=${recentSeason}`}
                                                key={i}
                                            >
                                                <div className={`flex border-2 flex-col items-center cursor-pointer ${themeClass.border}`}>
                                                    <Image
                                                        className="min-h-full object-cover my-2"
                                                        height="100"
                                                        width="100"
                                                        src={`https://media.api-sports.io/football/leagues/${league.league.id}.png`}
                                                        alt={league.league.name}
                                                    />
                                                    <p className="text-center">{league.league.name}</p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                    <Footer />
                </div>
            </div>
        </MainLayout>
    );
};

export default Leagues;
