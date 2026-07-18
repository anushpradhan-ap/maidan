// Re-export the existing LiveControl component as a section
import LiveControl from '@/components/LiveControl';
import { AdminTournament } from '@/lib/api';

interface Props { tournaments: AdminTournament[]; onRefresh: () => void; }
export default function LiveSection({ tournaments, onRefresh }: Props) {
  return <LiveControl tournaments={tournaments} onRefresh={onRefresh} />;
}
