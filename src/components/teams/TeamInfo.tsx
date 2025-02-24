import React, { useState } from "react";
import { useApp } from "../constants/contexts/AppContext";
import NavSlider from "../constants/NavSlider";

type Player = {
    id: string;
    name: string;
    photo: string;
    position: string;
    number?: number;
};

type Props = {
    players: Player[];
};


const TeamInfo: React.FC<Props> = ({ players }) => {
    const [content, setContent] = useState("Player");
    const { themeClass } = useApp();

    const handleContentChange = (name: string) => {
        setContent(name);
    };

    // ✅ Group Players by Position
    const groupedPlayers: Record<string, Player[]> = players.reduce((acc, player) => {
        if (!acc[player.position]) acc[player.position] = [];
        acc[player.position].push(player);
        return acc;
    }, {} as Record<string, Player[]>);

    return (
        <div className="desktop: xtab:mt-[4em] phone:mt-[6.5em] flex flex-col items-center px-2 w-full">
            <div className={`flex flex-col items-center z-10 ${themeClass.bg}`}>
                <NavSlider>
                    <div onClick={() => handleContentChange("Player")}
                        className={`flex ${content === "Player" ? "border-x-2 border-t-2" : "border-b-2 border-t-2 border-t-transparent"}
                        cursor-pointer ${themeClass.border} py-2 px-3 items-center`}>
                        <p className="font-semibold conc w-full">Players</p>
                    </div>
                    <div onClick={() => handleContentChange("Stadium")}
                        className={`flex ${content === "Stadium" ? "border-x-2 border-t-2" : "border-b-2 border-t-2 border-t-transparent"}
                        cursor-pointer py-2 px-3 items-center ${themeClass.border}`}>
                        <p className="font-semibold conc w-full">Stadium</p>
                    </div>
                </NavSlider>
            </div>

            {/* ✅ Display Players When "Players" Tab is Selected */}
            {content === "Player" && (
                <div className="w-full px-3">
                    <h2 className="text-center font-bold text-lg">Squad</h2>
                    {players.length > 0 ? (
                        <div className="grid gap-4 mt-4">
                            {Object.keys(groupedPlayers).map((position) => (
                                <div key={position} className="border border-gray-300 rounded-lg p-3">
                                    <h3 className="font-bold text-lg text-center">{position}</h3>
                                    <ul className="grid grid-cols-2 phone:grid-cols-3 tablet:grid-cols-4 gap-2 mt-2">
                                        {groupedPlayers[position].map((player: Player) => (
                                            <li key={player.id} className="flex flex-col items-center p-2">
                                                <img src={player.photo} alt={player.name} className="w-12 h-12 rounded-full" />
                                                <p className="font-semibold">{player.name}</p>
                                                <p className="text-xs text-gray-500">#{player.number || "N/A"}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 mt-2">No players available</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default TeamInfo;
