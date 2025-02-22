import React, { useEffect, useState } from "react";
import { getPlayers } from "../helpers/apiCalls"; // ✅ API Call for players

type Player = {
    id: number;
    name: string;
    position: string;
    country: { name: string };
};

type Props = {
    playerIds: number[];
    groupBy?: "position" | "country"; // ✅ Option to group by position or country
};

const PlayerList: React.FC<Props> = ({ playerIds, groupBy = "position" }) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPlayers = async () => {
            if (playerIds.length === 0) return;

            setLoading(true);
            try {
                const playerRequests = playerIds.map((id) =>
                    getPlayers({ params: { id } }).then((res) => res.response[0])
                );
                const results = await Promise.all(playerRequests);
                setPlayers(results.filter((p) => p)); // ✅ Remove `undefined` results
            } catch (error) {
                console.error("Error fetching players:", error);
                setPlayers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayers();
    }, [playerIds]);

    // ✅ Group Players by `position` or `country`
    const groupedPlayers = players.reduce((acc, player) => {
        const key = groupBy === "position" ? player.position : player.country?.name;
        if (!acc[key]) acc[key] = [];
        acc[key].push(player);
        return acc;
    }, {} as Record<string, Player[]>);

    return (
        <div className="w-full px-3">
            <h2 className="text-center font-bold text-lg">Squad</h2>
            {loading ? (
                <p className="text-center text-gray-500 mt-2">Loading players...</p>
            ) : (
                <div className="grid grid-cols-2 phone:grid-cols-3 tablet:grid-cols-4 gap-2">
                    {Object.keys(groupedPlayers).map((group) => (
                        <div key={group} className="p-2 border border-gray-300 rounded-md">
                            <h3 className="font-semibold text-center text-lg">{group}</h3>
                            <ul className="mt-2">
                                {groupedPlayers[group].map((player) => (
                                    <li key={player.id} className="text-center">
                                        <p className="font-semibold">{player.name}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlayerList;
