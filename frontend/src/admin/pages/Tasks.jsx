import React, { useState, useEffect } from "react";
import { 
  ClipboardList, Plus, Clock, CheckCircle, 
  Send, ExternalLink, RefreshCw, Star, X, Edit3, User, Calendar
} from "lucide-react";
import { Card, Badge, SectionHeader } from "../../shared/components/UI";
import api from "../../utils/api";

const Tasks = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Assignment Form State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    assignedToId: ""
  });
  const [assigning, setAssigning] = useState(false);

  // Grading Modal State
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradeForm, setGradeForm] = useState({ score: "", feedback: "" });
  const [grading, setGrading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [taskRes, userRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/users')
      ]);

      if (taskRes.data?.success) {
        setTasks(taskRes.data.data);
      }
      if (userRes.data?.success) {
        // Filter student registry
        const studentList = Array.isArray(userRes.data.data) 
          ? userRes.data.data.filter(u => u.role === 'STUDENT') 
          : [];
        setStudents(studentList);
      }
    } catch (err) {
      console.error("Failed to load console data:", err);
      setError("Failed to synchronize task console database registries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!assignForm.assignedToId) {
      alert("Please select an intern to assign this task.");
      return;
    }
    setAssigning(true);
    try {
      const res = await api.post('/tasks', {
        title: assignForm.title,
        description: assignForm.description,
        dueDate: assignForm.dueDate,
        priority: assignForm.priority,
        assignedToId: parseInt(assignForm.assignedToId)
      });
      if (res.data?.success) {
        setShowAssignModal(false);
        setAssignForm({ title: "", description: "", dueDate: "", priority: "Medium", assignedToId: "" });
        await fetchData();
        alert("Task assigned successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Task assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  const handleOpenGrade = (submission, taskTitle) => {
    setSelectedSubmission({ ...submission, taskTitle });
    setGradeForm({ 
      score: submission.score !== null ? parseFloat(submission.score).toString() : "", 
      feedback: submission.feedback || "" 
    });
    setShowGradeModal(true);
  };

  const handleReviewSubmission = async (e) => {
    e.preventDefault();
    setGrading(true);
    try {
      const res = await api.post(`/tasks/review/${selectedSubmission.id}`, {
        score: parseFloat(gradeForm.score),
        feedback: gradeForm.feedback
      });
      if (res.data?.success) {
        setShowGradeModal(false);
        await fetchData();
        alert("Evaluation logged successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Evaluation update failed");
    } finally {
      setGrading(false);
    }
  };

  // Collect all submissions across tasks for easy review
  const allSubmissions = [];
  tasks.forEach(task => {
    if (Array.isArray(task.submissions)) {
      task.submissions.forEach(sub => {
        allSubmissions.push({
          ...sub,
          taskTitle: task.title,
          internName: task.assignedTo?.name || "Intern",
          internEmail: task.assignedTo?.email || ""
        });
      });
    }
  });

  if (loading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center gap-4 opacity-40">
        <RefreshCw className="animate-spin text-orange-500" size={48} />
        <p className="font-black uppercase tracking-widest text-sm text-slate-400">Loading console registries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 text-slate-300">
      <SectionHeader
        title="Intern Assignments Console"
        subtitle="Issue curriculum tasks, monitor work submissions, and file grading evaluations"
        action={
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-5 py-3 rounded-xl text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}
          >
            <Plus size={14} /> Assign Task
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ACTIVE ASSIGNMENTS LIST */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-black tracking-tight text-white mb-2 flex items-center gap-2">
            <ClipboardList size={20} className="text-orange-500" />
            Issued Task Registries
          </h3>

          {tasks.length > 0 ? (
            tasks.map(task => {
              const submission = task.submissions?.[0];
              return (
                <Card key={task.id} className="p-6 relative overflow-hidden group hover:scale-[1.01] transition-all duration-300" style={{ background: '#0f172a', borderColor: 'rgba(255,109,52,0.1)' }}>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-md font-black tracking-tight text-white">{task.title}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <User size={10} className="opacity-55" />
                        <span className="text-[10px] font-bold opacity-50 uppercase tracking-wider">
                          Assignee: {task.assignedTo?.name || "Intern"} ({task.assignedTo?.department || "General"})
                        </span>
                      </div>
                    </div>
                    <Badge variant={task.priority === "High" ? "danger" : task.priority === "Medium" ? "purple" : "success"}>
                      {task.priority} Priority
                    </Badge>
                  </div>

                  <p className="text-xs font-semibold opacity-70 mb-6 text-slate-400">{task.description}</p>

                  <div className="border-t pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-1.5 text-xs font-bold opacity-60">
                        <Clock size={14} />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>

                      {submission && (
                        <Badge variant={submission.status === 'Reviewed' ? "success" : "purple"}>
                          {submission.status === 'Reviewed' ? `Graded: ${parseFloat(submission.score)}/10` : "Submitted & Unreviewed"}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {submission ? (
                        <button
                          onClick={() => handleOpenGrade(submission, task.title)}
                          className="px-3.5 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 font-black uppercase text-[9px] hover:bg-orange-500/20 transition-all flex items-center gap-1"
                        >
                          <Edit3 size={10} /> {submission.status === 'Reviewed' ? "Revise Evaluation" : "Review Submittal"}
                        </button>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-wider opacity-40">Awaiting Submission</span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="p-20 text-center opacity-40" style={{ background: '#0f172a', borderColor: 'rgba(255,109,52,0.1)' }}>
              <ClipboardList className="mx-auto text-slate-500 mb-4" size={48} />
              <p className="font-black uppercase tracking-widest text-sm text-white">No tasks assigned yet</p>
            </Card>
          )}
        </div>

        {/* SUBMISSIONS LEDGER (SIDEBAR FEED) */}
        <div className="space-y-6">
          <h3 className="text-lg font-black tracking-tight text-white mb-2 flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-500" />
            Submissions Feed
          </h3>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {allSubmissions.length > 0 ? (
              allSubmissions.map(sub => (
                <Card key={sub.id} className="p-5 space-y-3 relative hover:scale-[1.01] transition-transform" style={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-xs font-black text-white truncate max-w-[180px]">{sub.taskTitle}</h5>
                      <p className="text-[9px] font-bold opacity-50 uppercase mt-0.5">By {sub.internName}</p>
                    </div>
                    <Badge variant={sub.status === 'Reviewed' ? "success" : "purple"}>
                      {sub.status === 'Reviewed' ? `Grade: ${parseFloat(sub.score)}/10` : "Pending"}
                    </Badge>
                  </div>

                  <div className="px-3 py-2 bg-slate-900/50 rounded-lg border border-white/5 text-[10px] font-mono text-slate-400 break-all select-all">
                    {sub.content}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[9px] font-bold opacity-45">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleOpenGrade(sub, sub.taskTitle)}
                      className="px-2.5 py-1.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-500 font-black uppercase text-[8px] hover:bg-orange-500/20 transition-all"
                    >
                      {sub.status === 'Reviewed' ? "Grade" : "Review"}
                    </button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-10 text-center opacity-40" style={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.05)' }}>
                <p className="font-black uppercase tracking-widest text-[9px] text-white">No submissions uploaded yet</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* TASK ASSIGNMENT MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-lg p-8 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] shadow-2xl flex flex-col text-slate-800 dark:text-white">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Issue Intern Task</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAssignTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={assignForm.title}
                  onChange={e => setAssignForm({ ...assignForm, title: e.target.value })}
                  placeholder="e.g. Implement JWT Verification Middleware"
                  className="w-full px-4 py-3 rounded-xl text-sm font-semibold outline-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-orange-500 transition-all placeholder-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Task Description</label>
                <textarea
                  required
                  rows={4}
                  value={assignForm.description}
                  onChange={e => setAssignForm({ ...assignForm, description: e.target.value })}
                  placeholder="Provide explicit instructions or repository task details..."
                  className="w-full px-4 py-3 rounded-xl text-sm font-semibold outline-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-orange-500 transition-all placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Target Intern</label>
                  <select
                    required
                    value={assignForm.assignedToId}
                    onChange={e => setAssignForm({ ...assignForm, assignedToId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm font-semibold outline-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-orange-500 transition-all"
                    style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                  >
                    <option value="" style={{ background: 'var(--card)' }}>Select intern...</option>
                    {students.map(std => (
                      <option key={std.id} value={std.id} style={{ background: 'var(--card)' }}>
                        {std.name} ({std.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Priority</label>
                  <select
                    value={assignForm.priority}
                    onChange={e => setAssignForm({ ...assignForm, priority: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm font-semibold outline-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-slate-900 dark:text-white focus:border-orange-500 transition-all"
                    style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                  >
                    <option value="High" style={{ background: 'var(--card)' }}>High</option>
                    <option value="Medium" style={{ background: 'var(--card)' }}>Medium</option>
                    <option value="Low" style={{ background: 'var(--card)' }}>Low</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Due Date</label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={assignForm.dueDate}
                    onChange={e => setAssignForm({ ...assignForm, dueDate: e.target.value })}
                    className="w-full pl-4 pr-10 py-3.5 rounded-xl text-sm font-semibold outline-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-slate-900 dark:text-white focus:border-orange-500 transition-all"
                    style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                  />
                  <Calendar size={16} className="absolute right-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              
              <button 
                disabled={assigning}
                className="w-full py-3.5 mt-4 rounded-xl text-white font-black uppercase tracking-widest text-[10px] flex justify-center gap-2 hover:scale-[0.99] transition-transform shadow-lg shadow-orange-500/10"
                style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
                {assigning ? <RefreshCw className="animate-spin text-white" size={14} /> : "Publish Assignment"}
              </button>
            </form>
          </Card>
        </div>
      )}

      {/* GRADING & REVIEW MODAL */}
      {showGradeModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md p-8 relative overflow-hidden" style={{ background: '#0f172a', borderColor: 'rgba(255,109,52,0.1)' }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black tracking-tight text-white">Evaluate Submission</h3>
              <button onClick={() => setShowGradeModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleReviewSubmission} className="space-y-4">
              <div className="space-y-1 text-slate-400">
                <p className="text-[10px] font-bold uppercase tracking-wider">Task: <span className="text-white font-black">{selectedSubmission.taskTitle}</span></p>
                <p className="text-[10px] font-bold uppercase tracking-wider">Submitted By: <span className="text-white font-black">{selectedSubmission.internName || selectedSubmission.submitter?.name}</span></p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Grade (Score / 10.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  required
                  value={gradeForm.score}
                  onChange={e => setGradeForm({ ...gradeForm, score: e.target.value })}
                  placeholder="e.g. 9.5"
                  className="w-full px-4 py-3 rounded-xl text-sm font-bold outline-none border focus:border-orange-500"
                  style={{ background: '#020617', borderColor: 'rgba(255,255,255,0.08)', color: '#ffffff' }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Constructive Feedback</label>
                <textarea
                  required
                  rows={4}
                  value={gradeForm.feedback}
                  onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  placeholder="Provide critique, improvement suggestions, or congratulations..."
                  className="w-full px-4 py-3 rounded-xl text-sm font-bold outline-none border focus:border-orange-500"
                  style={{ background: '#020617', borderColor: 'rgba(255,255,255,0.08)', color: '#ffffff' }}
                />
              </div>
              
              <button 
                disabled={grading}
                className="w-full py-3.5 mt-4 rounded-xl text-white font-black uppercase tracking-widest text-[10px] flex justify-center gap-2 hover:scale-[0.99] transition-transform"
                style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
                {grading ? <RefreshCw className="animate-spin text-white" size={14} /> : "Submit Evaluation"}
              </button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Tasks;
