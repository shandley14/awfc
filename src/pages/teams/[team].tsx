import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useApp } from '../../components/constants/contexts/AppContext';
import LinearLoader from '../../components/constants/LinearProgress';
import NavBar from '../../components/constants/NavBar';
import SideBar from '../../components/constants/SideBar';
import TeamInfo from '../../components/teams/TeamInfo';
import { getTeams, getSquad } from '../../helpers/apiCalls';

const Team = () => {
  const { themeClass } = useApp();
  const [teamDetails, setTeamDetails] = useState<any>(null);
  const [linear, setLinear] = useState<boolean>(false);
  const [players, setPlayers] = useState<any[]>([]);
  const router = useRouter();
  const { team } = router.query;

  const getTeamById = async () => {
    if (!team) return;

    const opts = { params: { id: team }, headers: { 'Content-Type': 'application/json' } };
    const data = await getTeams(opts);
    if (data.response.length !== 0) setTeamDetails(data.response[0]);

    const playerData = await getSquad({ params: { team: team }, headers: { 'Content-Type': 'application/json' } });
    if (playerData && playerData.length !== 0) setPlayers(playerData);
  };

  useEffect(() => {
    if (team) getTeamById();
  }, [team]);

  return (
    <div className={`flex flex-col ${themeClass.bg} w-full min-h-screen`}>
      {linear && <LinearLoader />}
      <NavBar />
      <div className="flex flex-col items-center w-full px-4 py-6">
        {teamDetails ? (
          <>
            {/* Team Banner */}
            <div className="w-full max-w-4xl">
              <img className="w-full h-48 object-cover rounded-md" src={teamDetails?.venue.image} alt="" />
            </div>

            {/* Team Info Section */}
            <div className="w-full max-w-4xl mt-4 text-center">
              <Image className="mx-auto rounded-full" height="80" width="80" src={teamDetails?.team.logo} alt={teamDetails?.team.name} />
              <h1 className="mt-2 text-2xl font-bold">{teamDetails?.team.name || 'Unknown Team'}</h1>
              <p className="text-gray-500">{teamDetails?.team.country || 'Unknown Country'}</p>
            </div>

            {/* Team Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-6 w-full max-w-3xl text-center">
              <div><p className="text-gray-400">Founded</p><p className="font-semibold">{teamDetails?.team.founded || 'N/A'}</p></div>
              <div><p className="text-gray-400">Venue</p><p className="font-semibold">{teamDetails?.venue?.name || 'N/A'}</p></div>
              <div><p className="text-gray-400">City</p><p className="font-semibold">{teamDetails?.venue?.city || 'N/A'}</p></div>
              <div><p className="text-gray-400">Address</p><p className="font-semibold">{teamDetails?.venue?.address || 'N/A'}</p></div>
            </div>

            {/* Players Section */}
            <TeamInfo players={players} />
          </>
        ) : (
          <p className="text-lg">Loading team details...</p>
        )}
      </div>
    </div>
  );
};

export default Team;
