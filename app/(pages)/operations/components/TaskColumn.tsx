'use client';

import React from 'react';
import TaskCard from './TaskCard';

interface Task {
  id: string;
  title: string;
  vehicle: string;
  timestamp: string;
  badge: string;
  badgeColor?: 'blue' | 'red' | 'purple' | 'green';
}

interface TaskColumnProps {
  title: string;
  count: number;
  tasks: Task[];
  icon?: React.ReactNode;
}

export default function TaskColumn({ title, count, tasks, icon }: TaskColumnProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 max-h-[36rem] flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        {icon && <div className="text-lg">{icon}</div>}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="ml-auto bg-orange-100 text-orange-700 text-sm font-semibold px-2 py-1 rounded">
          {count}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2" role="list" aria-label={`${title} tasks`}>
        {tasks.map((task) => (
          <TaskCard key={task.id} {...task} />
        ))}
      </div>
    </div>
  );
}
