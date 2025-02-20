import { useRouter } from 'next/router';
import Feed from '../Feed';

const LeaguePage = () => {
  const router = useRouter();
  const { id } = router.query; // Get league ID from URL

  if (!id) return <p>Loading...</p>;

  return <Feed leagueId={id} />;
};

export default LeaguePage;
