import React, { useState } from 'react';
import { useTodoStore } from '../../store';
import { Button } from '../common/Button';

export const TodoForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const { createTodo } = useTodoStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      await createTodo({ title });
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new todo..."
        className="input-field flex-1"
      />
      <Button type="submit">Add</Button>
    </form>
  );
};
