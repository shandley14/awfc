import { useRouter } from 'next/router';
import Feed from '../../pages/Feed';

const LeaguePage = () => {
  const router = useRouter();
  const { id, season } = router.query;

  // Ensure id is a string (handle potential array case)
  const leagueId = Array.isArray(id) ? id[0] : id;

  // Ensure season is a string or number (convert if needed)
  const seasonValue = Array.isArray(season) ? season[0] : season;
  
  return <Feed leagueId={leagueId} season={seasonValue} />;
};

export default LeaguePage;
