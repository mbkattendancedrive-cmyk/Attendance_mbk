import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Award, 
  X, 
  UserCheck,
  Calendar,
  AlertTriangle
} from 'lucide-react';

const TaskManagement = () => {
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTaskObj, setDeleteTaskObj] = useState(null);
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

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    points: 20,
    priority: 'Medium',
    dueDate: '',
  });

  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchInitialData();
    if (searchParams.get('add') === 'true') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [tasksRes, empRes] = await Promise.all([
        API.get('/tasks'),
        API.get('/employees')
      ]);
      setTasks(tasksRes.data);
      const activeEmps = empRes.data.filter(e => e.status === 'Active');
      setEmployees(activeEmps);
      if (activeEmps.length > 0 && !formData.assignedTo) {
        setFormData(prev => ({ ...prev, assignedTo: activeEmps[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      await API.post('/tasks', formData);
      setShowAddModal(false);
      resetForm();
      fetchInitialData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      await API.put(`/tasks/${editTask._id}`, formData);
      setEditTask(null);
      resetForm();
      fetchInitialData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await API.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchInitialData();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskObj) return;
    try {
      await API.delete(`/tasks/${deleteTaskObj._id}`);
      setDeleteTaskObj(null);
      fetchInitialData();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: employees[0]?._id || '',
      points: 20,
      priority: 'Medium',
      dueDate: '',
    });
    setFormError(null);
  };

  const openEditModal = (task) => {
    setEditTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo?._id || task.assignedTo,
      points: task.points,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.assignedTo?.name && t.assignedTo.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Task Management</h1>
          <p className="text-sm text-slate-500 mt-1">Assign objectives, set performance points, and track delivery progress.</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="btn-primary text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card-saas grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        <div className="md:col-span-2 relative">
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search tasks by title or assignee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-saas w-full pl-10 text-sm"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-saas w-full text-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input-saas w-full text-sm"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Task Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="card-saas text-center py-16 space-y-3">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No tasks found</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or create a new task.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => (
            <div key={task._id} className="card-saas space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
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
                  <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">{task.description}</p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 truncate">
                    <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{task.assignedTo?.name || 'Unassigned'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
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
                        <div className="absolute left-0 bottom-full mb-2 z-20 w-36 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 space-y-1 animate-fade-in">
                          {['Pending', 'In Progress', 'Completed', 'Cancelled'].map((status) => (
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

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteTaskObj(task)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTaskObj && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Delete Task</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Are you sure you want to delete task <strong className="text-slate-900">"{deleteTaskObj.title}"</strong>?
            </p>
            {deleteTaskObj.status === 'Completed' && (
              <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200/60 font-medium">
                Note: Deleting a completed task will deduct {deleteTaskObj.points} points awarded to the employee.
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTaskObj(null)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                className="btn-danger text-xs"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {(showAddModal || editTask) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full relative space-y-5 shadow-xl animate-fade-in">
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditTask(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">
              {editTask ? `Edit Task: ${editTask.title}` : 'Create & Assign Task'}
            </h3>

            {formError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={editTask ? handleEditTask : handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-saas w-full text-sm"
                  placeholder="e.g. Develop Login API"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-saas w-full text-sm resize-none"
                  placeholder="Task guidelines and deliverables..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Employee</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="input-saas text-sm w-full truncate"
                    required
                  >
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Points</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                    className="input-saas text-sm w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input-saas text-sm w-full"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input-saas text-sm w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditTask(null);
                  }}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  {editTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
