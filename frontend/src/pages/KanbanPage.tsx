import React from 'react';
import { KanbanBoard } from '../../components/kanban/KanbanBoard';

export const KanbanPage: React.FC = () => {
  return (
    <div className="h-full">
      <KanbanBoard />
    </div>
  );
};
