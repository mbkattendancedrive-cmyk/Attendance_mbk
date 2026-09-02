import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { 
  CheckSquare, 
  Award, 
  Calendar
} from 'lucide-react';

const EmployeeMyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeDropdownTaskId, setActiveDropdownTaskId] = useState(null);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed': return 'badge-success';
      case 'In Progress': return 'badge-info';
      case 'Cancelled': return 'badge-neutral';
      default: return 'badge-warning';
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500';
      case 'In Progress': return 'bg-sky-500';
      case 'Cancelled': return 'bg-slate-400';
      default: return 'bg-amber-500';
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/tasks/employee');
      setTasks(data);
    } catch (err) {
      console.error('Failed to load employee tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await API.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchMyTasks();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const filteredTasks = tasks.filter(t => statusFilter === 'All' || t.status === statusFilter);

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Urgent': return 'badge-danger';
      case 'High': return 'badge-warning';
      case 'Medium': return 'badge-info';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Assigned Objectives</h1>
          <p className="text-sm text-slate-500 mt-1">Track deliverables, update status to Completed, and earn performance points.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-saas p-4 flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-slate-700">Filter Tasks:</span>

        <div className="flex flex-wrap gap-2">
          {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="card-saas text-center py-16 space-y-3">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No tasks found</h3>
          <p className="text-xs text-slate-500">Your assigned tasks will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTasks.map((task) => (
            <div key={task._id} className="card-saas p-5 space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={getPriorityBadgeClass(task.priority)}>
                    {task.priority} Priority
                  </span>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 inline-flex items-center gap-1.5 tabular-nums">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    +{task.points} Pts
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-snug">{task.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{task.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs font-semibold">Status:</span>
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdownTaskId(activeDropdownTaskId === task._id ? null : task._id)}
                      className={`${getStatusBadgeClass(task.status)} font-semibold cursor-pointer py-1 px-3`}
                    >
                      <span className={`w-2 h-2 rounded-full ${getStatusDotColor(task.status)}`}></span>
                      {task.status}
                    </button>
                    
                    {activeDropdownTaskId === task._id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setActiveDropdownTaskId(null)}
                        />
                        <div className="absolute right-0 bottom-full mb-2 z-20 w-36 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 space-y-1 animate-fade-in">
                          {['Pending', 'In Progress', 'Completed'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => {
                                handleStatusChange(task._id, status);
                                setActiveDropdownTaskId(null);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                                task.status === status 
                                  ? 'bg-slate-100 text-slate-900 font-bold' 
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(status)}`}></span>
                              {status}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeMyTasks;
