// leagues/[id].tsx
import { useRouter } from 'next/router';
import Feed from '../Feed';

const LeaguePage = () => {
  const router = useRouter();
  console.log("Router Query:", router.query);

  const { id, season } = router.query; // Extract season as well

  if (!id || !season) return <p>Loading...</p>;

  // Pass the season to the Feed component or use it as needed in your API calls
  return <Feed leagueId={id} season={season} />;
};

export default LeaguePage;
