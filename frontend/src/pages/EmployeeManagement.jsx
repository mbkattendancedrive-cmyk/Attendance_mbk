import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import IDCardModal from '../components/IDCardModal';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  Award, 
  X,
  UserCheck,
  UserX,
  Eye,
  CheckSquare,
  Mail,
  Phone,
  Calendar,
  Trash2,
  Image as ImageIcon,
  User,
  Heart,
  ShieldAlert,
  Building2,
  ChevronLeft,
  ArrowRight
} from 'lucide-react';

const EmployeeManagement = () => {
  const [searchParams] = useSearchParams();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [selectedDept, setSelectedDept] = useState(null);

  // Modals state
  const [selectedIDCardEmp, setSelectedIDCardEmp] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [confirmStatusEmp, setConfirmStatusEmp] = useState(null);
  const [deleteConfirmEmp, setDeleteConfirmEmp] = useState(null);

  const handleDeleteEmployee = async () => {
    if (!deleteConfirmEmp) return;
    try {
      await API.delete(`/employees/${deleteConfirmEmp._id}`);
      setDeleteConfirmEmp(null);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee');
    }
  };
  
  // Profile Detail Modal State
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Form State for Add/Edit
  const [formData, setFormData] = useState({
    employeeId: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: '',
    dateOfBirth: '',
    joiningDate: '',
    address: '',
    emergencyContact: '',
    bloodGroup: 'O+',
    profilePhoto: ''
  });

  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchEmployees();
    if (searchParams.get('add') === 'true') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/employees');
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!confirmStatusEmp) return;
    const newStatus = confirmStatusEmp.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await API.patch(`/employees/${confirmStatusEmp._id}/status`, { status: newStatus });
      setConfirmStatusEmp(null);
      setProfileData(null);
      fetchEmployees();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      await API.post('/employees', formData);
      setShowAddModal(false);
      resetForm();
      await fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add employee');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      await API.put(`/employees/${editEmployee._id}`, formData);
      setEditEmployee(null);
      resetForm();
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update employee');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      password: '',
      name: '',
      email: '',
      phone: '',
      department: 'Engineering',
      designation: '',
      dateOfBirth: '',
      joiningDate: '',
      address: '',
      emergencyContact: '',
      bloodGroup: 'O+',
      profilePhoto: ''
    });
    setFormError(null);
  };

  const openEditModal = (emp) => {
    setEditEmployee(emp);
    setFormData({
      employeeId: emp.employeeId || '',
      password: '',
      name: emp.name || '',
      email: emp.email || '',
      phone: emp.phone || '',
      department: emp.department || 'Engineering',
      designation: emp.designation || '',
      dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '',
      joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : '',
      address: emp.address || '',
      emergencyContact: emp.emergencyContact || '',
      bloodGroup: emp.bloodGroup || 'O+',
      profilePhoto: emp.profilePhoto || ''
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size must be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePhoto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, profilePhoto: '' }));
  };

  const openProfileDetail = async (empId) => {
    try {
      setProfileLoading(true);
      const { data } = await API.get(`/performance/${empId}`);
      setProfileData(data);
    } catch (err) {
      alert('Failed to load employee profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    const matchesDeptFilter = departmentFilter === 'All' || emp.department === departmentFilter;
    const matchesSelectedDept = !selectedDept || selectedDept === 'All' || emp.department === selectedDept;

    return matchesSearch && matchesStatus && matchesDeptFilter && matchesSelectedDept;
  });

  const departments = ['Marketing', 'Telecalling', 'IT'];

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage personnel records, issue corporate identity badges, and view performance.</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="btn-primary text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Controls Filter Bar */}
      <div className="card-saas grid grid-cols-1 md:grid-cols-4 gap-3 p-4">
        <div className="md:col-span-2 relative">
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by employee name, ID (EMP001), or email..."
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
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>

        <div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="input-saas w-full text-sm"
          >
            <option value="All">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Department Cards or Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
        </div>
      ) : !selectedDept && !searchTerm ? (
        /* Department Selection Cards */
        <div className="space-y-4">
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={() => setSelectedDept('All')}
              className="btn-secondary text-sm bg-white shadow-sm flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto"
            >
              <Users className="w-4 h-4 text-slate-500" />
              View All Employees ({employees.length})
            </button>
            <div className="text-center sm:text-right">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">Departments</h2>
              <p className="text-xs text-slate-500 mt-0.5">Select a department to explore employee records</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {departments.map((dept) => {
              const count = employees.filter((e) => e.department === dept).length;
              return (
                <div
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className="card-saas p-6 hover:border-slate-300 cursor-pointer group space-y-4 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200/80">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60 tabular-nums">
                      {count} Members
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-800">
                      {dept}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Personnel directory & profile management
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 group-hover:text-slate-900">
                    <span>Explore Department</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="card-saas text-center py-16 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No employees match your search</h3>
          <p className="text-xs text-slate-500">Try clearing filters or adjusting your search query.</p>
        </div>
      ) : (
        /* Employee Table */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border border-slate-200/80 px-4 py-3 rounded-xl shadow-2xs">
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setSelectedDept(null)}
                className="font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Departments
              </button>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-slate-900 text-xs">
                {selectedDept === 'All' ? 'All Departments' : `${selectedDept} Department`} ({filteredEmployees.length} Personnel)
              </span>
            </div>

            {selectedDept && (
              <button
                onClick={() => setSelectedDept(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
              >
                Show All Departments
              </button>
            )}
          </div>

          <div className="card-saas p-0">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    <th className="p-4 pl-5">Employee</th>
                    <th className="p-4">Department & Designation</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Score</th>
                    <th className="p-4 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-normal">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-5">
                        <div className="flex items-center gap-3.5">
                          {emp.profilePhoto ? (
                            <img
                              src={emp.profilePhoto}
                              alt={emp.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {emp.name[0]}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              {emp.name}
                              <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 font-semibold">
                                {emp.employeeId}
                              </span>
                            </div>
                            <div className="text-slate-500 text-xs mt-0.5">{emp.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-900 text-sm">{emp.designation}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{emp.department}</div>
                      </td>

                      <td className="p-4 text-slate-600 font-mono text-xs">
                        {new Date(emp.joiningDate).toLocaleDateString()}
                      </td>

                      <td className="p-4">
                        <span className={emp.status === 'Active' ? 'badge-success' : 'badge-danger'}>
                          {emp.status === 'Active' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          {emp.status}
                        </span>
                      </td>

                      <td className="p-4 text-center font-bold text-slate-800 tabular-nums">
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200/60 text-xs font-bold">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          {emp.totalPoints || 0} Pts
                        </span>
                      </td>

                      <td className="p-4 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openProfileDetail(emp._id)}
                            title="View Profile"
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setSelectedIDCardEmp(emp)}
                            title="ID Card"
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openEditModal(emp)}
                            title="Edit Profile"
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setConfirmStatusEmp(emp)}
                            title={emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            {emp.status === 'Active' ? <UserX className="w-4 h-4 text-amber-600" /> : <UserCheck className="w-4 h-4 text-emerald-600" />}
                          </button>

                          <button
                            onClick={() => setDeleteConfirmEmp(emp)}
                            title="Delete Employee"
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Stacked Card View (Zero Horizontal Scroll!) */}
            <div className="block md:hidden p-3.5 space-y-3">
              {filteredEmployees.map((emp) => (
                <div key={emp._id} className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {emp.profilePhoto ? (
                        <img
                          src={emp.profilePhoto}
                          alt={emp.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {emp.name[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{emp.name}</div>
                        <div className="font-mono text-xs text-slate-500">{emp.employeeId}</div>
                      </div>
                    </div>

                    <span className={emp.status === 'Active' ? 'badge-success text-[11px]' : 'badge-danger text-[11px]'}>
                      {emp.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Designation</span>
                      <span className="font-semibold text-slate-900 truncate block">{emp.designation}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Department</span>
                      <span className="font-semibold text-slate-700 block">{emp.department}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200/60 text-xs font-bold">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      {emp.totalPoints || 0} Pts
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openProfileDetail(emp._id)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedIDCardEmp(emp)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(emp)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmStatusEmp(emp)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      >
                        {emp.status === 'Active' ? <UserX className="w-4 h-4 text-amber-600" /> : <UserCheck className="w-4 h-4 text-emerald-600" />}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmEmp(emp)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {profileLoading && (
        <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-xs flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
        </div>
      )}

      {/* Profile Detail Modal */}
      {profileData && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 max-w-2xl w-full relative space-y-6 shadow-xl animate-fade-in">
            <button
              onClick={() => setProfileData(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-slate-100">
              {profileData.employee.profilePhoto ? (
                <img
                  src={profileData.employee.profilePhoto}
                  alt={profileData.employee.name}
                  className="w-16 h-16 rounded-full object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xl shrink-0">
                  {profileData.employee.name[0]}
                </div>
              )}
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h2 className="text-xl font-bold text-slate-900">{profileData.employee.name}</h2>
                  <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 font-semibold">
                    {profileData.employee.employeeId}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{profileData.employee.designation}</p>
                <p className="text-xs text-slate-500">{profileData.employee.department} Department</p>
              </div>
              
              <div className="sm:ml-auto">
                <span className={profileData.employee.status === 'Active' ? 'badge-success' : 'badge-danger'}>
                  {profileData.employee.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Assigned Tasks</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block tabular-nums">{profileData.stats.totalTasks}</span>
              </div>
              <div className="p-3 bg-emerald-50/60 border border-emerald-200/50 rounded-xl">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">Completed</span>
                <span className="text-lg font-bold text-emerald-800 mt-0.5 block tabular-nums">{profileData.stats.completedTasks}</span>
              </div>
              <div className="p-3 bg-sky-50/60 border border-sky-200/50 rounded-xl">
                <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider block">Pending</span>
                <span className="text-lg font-bold text-sky-800 mt-0.5 block tabular-nums">{profileData.stats.pendingTasks}</span>
              </div>
              <div className="p-3 bg-amber-50/60 border border-amber-200/50 rounded-xl">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">Completion</span>
                <span className="text-lg font-bold text-amber-800 mt-0.5 block tabular-nums">{profileData.stats.completionRate}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-normal border-t border-slate-100 pt-4">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> Email</span>
                <span className="text-slate-900 font-semibold">{profileData.employee.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> Phone</span>
                <span className="text-slate-900 font-semibold">{profileData.employee.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> Joined</span>
                <span className="text-slate-900 font-semibold">{new Date(profileData.employee.joiningDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-2"><Award className="w-4 h-4 text-amber-500" /> Total Points</span>
                <span className="text-amber-700 font-bold tabular-nums">{profileData.employee.totalPoints || 0} Pts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-2"><Heart className="w-4 h-4 text-rose-500" /> Blood Group</span>
                <span className="text-rose-700 font-bold">{profileData.employee.bloodGroup || 'O+'}</span>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-slate-500" />
                Task History
              </h3>
              
              {profileData.tasks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl">No tasks assigned yet.</p>
              ) : (
                <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
                  {profileData.tasks.map((task) => (
                    <div key={task._id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900">{task.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className={getPriorityBadgeClass(task.priority)}>{task.priority}</span>
                          <span>•</span>
                          <span className="font-mono text-amber-700 font-bold">+{task.points} Pts</span>
                          <span>•</span>
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <span className={
                        task.status === 'Completed' ? 'badge-success' :
                        task.status === 'In Progress' ? 'badge-info' :
                        'badge-warning'
                      }>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedIDCardEmp(profileData.employee)}
                className="btn-secondary text-xs"
              >
                <QrCode className="w-4 h-4" />
                ID Card
              </button>
              <button
                onClick={() => openEditModal(profileData.employee)}
                className="btn-secondary text-xs"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setProfileData(null)}
                className="btn-primary text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ID Card Modal */}
      {selectedIDCardEmp && (
        <IDCardModal
          employee={selectedIDCardEmp}
          onClose={() => setSelectedIDCardEmp(null)}
        />
      )}

      {/* Status Toggle Modal */}
      {confirmStatusEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-amber-600">
              <UserCheck className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Confirm Status Change</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Change <span className="font-semibold text-slate-900">{confirmStatusEmp.name}</span>'s status to{' '}
              <span className="font-semibold text-slate-900">{confirmStatusEmp.status === 'Active' ? 'Inactive' : 'Active'}</span>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmStatusEmp(null)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                className={confirmStatusEmp.status === 'Active' ? 'btn-danger text-xs' : 'btn-primary text-xs'}
              >
                Confirm Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      {(showAddModal || editEmployee) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] flex flex-col relative shadow-xl my-auto animate-fade-in">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-700" />
                  {editEmployee ? `Edit Employee: ${editEmployee.name}` : 'Register New Employee'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Fill in credentials for employee registration & ID card generation.</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditEmployee(null);
                  resetForm();
                }}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="overflow-y-auto pr-1 space-y-4 flex-1">
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <form id="employee-form" onSubmit={editEmployee ? handleEditSubmit : handleAddSubmit} className="space-y-4">
                
                {/* Photo & Basic Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  
                  {/* Photo Area */}
                  <div className="lg:col-span-1 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Profile Photo</label>
                    
                    <div className="flex flex-col items-center justify-center p-4 h-[175px] bg-slate-50 border border-dashed border-slate-300 rounded-xl hover:bg-slate-100/50 transition-colors relative">
                      {formData.profilePhoto ? (
                        <div className="relative">
                          <img 
                            src={formData.profilePhoto} 
                            alt="Preview" 
                            className="w-24 h-24 rounded-full object-cover border border-slate-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={removePhoto}
                            className="absolute -top-1 -right-1 bg-rose-600 text-white p-1 rounded-full hover:bg-rose-700 transition-colors shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                          <label className="btn-secondary text-xs py-1.5 px-3 cursor-pointer">
                            Upload Photo
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileChange} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="lg:col-span-2 space-y-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Personal Information</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="input-saas w-full text-sm"
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Blood Group</label>
                        <select
                          value={formData.bloodGroup}
                          onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                          className="input-saas w-full text-sm"
                        >
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Date of Birth</label>
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          className="input-saas w-full text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Date of Joining</label>
                        <input
                          type="date"
                          required
                          value={formData.joiningDate}
                          onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                          className="input-saas w-full text-sm"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Corporate Info */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Corporate Assignments</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Custom Employee ID <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input
                        type="text"
                        disabled={!!editEmployee}
                        value={formData.employeeId}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        className="input-saas w-full text-sm disabled:bg-slate-50 disabled:text-slate-500"
                        placeholder="Leave blank to auto-generate"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Login Password {editEmployee && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}</label>
                      <input
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input-saas w-full text-sm"
                        placeholder={editEmployee ? "••••••••" : "Password@123"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Corporate Email</label>
                      <input
                        type="email"
                        required
                        disabled={!!editEmployee}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-saas w-full text-sm disabled:bg-slate-50 disabled:text-slate-500"
                        placeholder="john@company.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Phone</label>
                      <input
                        type="text"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-saas w-full text-sm"
                        placeholder="9876543210"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Emergency Contact</label>
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        className="input-saas w-full text-sm"
                        placeholder="Emergency contact info"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Department</label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="input-saas w-full text-sm"
                      >
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Designation</label>
                      <input
                        type="text"
                        required
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        className="input-saas w-full text-sm"
                        placeholder="Senior Engineer"
                      />
                    </div>
                  </div>
                </div>

                {/* Residential Address */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700">Residential Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-saas w-full text-sm"
                    placeholder="Residential address details..."
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 shrink-0 mt-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditEmployee(null);
                  resetForm();
                }}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="employee-form"
                className="btn-primary text-xs"
              >
                {editEmployee ? 'Update Profile' : 'Register Employee'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Employee Confirmation Modal */}
      {deleteConfirmEmp && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Delete Employee</h3>
                <p className="text-xs text-slate-500">Permanent Database Action</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Are you sure you want to permanently delete <strong className="text-slate-900">{deleteConfirmEmp.name}</strong> (<span className="font-mono text-slate-700 font-semibold">{deleteConfirmEmp.employeeId}</span>)? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmEmp(null)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEmployee}
                className="btn-danger text-xs"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default EmployeeManagement;
