import React from 'react';

function TaskFilter({ filter, setFilter }) {
  return (
    <div>
      <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>
        All Tasks
      </button>
      <button onClick={() => setFilter('active')} className={filter === 'active' ? 'active' : ''}>
        Active Tasks
      </button>
      <button onClick={() => setFilter('completed')} className={filter === 'completed' ? 'active' : ''}>
        Completed Tasks
      </button>
    </div>
  );
}

export default TaskFilter;
