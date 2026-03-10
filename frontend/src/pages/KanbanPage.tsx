import { useSearchParams } from 'react-router-dom';
import { KanbanBoard } from '../components/kanban/KanbanBoard';

export const KanbanPage = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || undefined;

  return (
    <div className="h-full">
      <KanbanBoard projectId={projectId} />
    </div>
  );
};
