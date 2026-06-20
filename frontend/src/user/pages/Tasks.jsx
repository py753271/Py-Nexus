import React, { useState, useEffect } from "react";
import { 
  ClipboardList, AlertCircle, Clock, CheckCircle, 
  Send, ExternalLink, RefreshCw, Cpu, CheckSquare, X
} from "lucide-react";
import { Card, Badge, SectionHeader } from "../../shared/components/UI";
import api from "../../utils/api";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // AI Insights state
  const [aiInsights, setAiInsights] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  // Submit Modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({ content: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/tasks');
      if (res.data?.success) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Failed to fetch assigned tasks registry.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAiInsights = async () => {
    try {
      setLoadingAi(true);
      const res = await api.get('/ai/insights');
      if (res.data?.success) {
        setAiInsights(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load AI insights:", err);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchAiInsights();
  }, []);

  const handleOpenSubmit = (task) => {
    setSelectedTask(task);
    setSubmitForm({ content: "" });
    setShowSubmitModal(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/tasks/submit', {
        taskId: selectedTask.id,
        content: submitForm.content
      });
      if (res.data?.success) {
        setShowSubmitModal(false);
        await fetchTasks();
        alert("Task submission logged successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Task submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center gap-4 opacity-40">
        <Loader2 className="animate-spin text-orange-500" size={48} />
        <p className="font-black uppercase tracking-widest text-sm text-slate-400 dark:text-white">Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <SectionHeader
        title="My Tasks"
        subtitle="Track assigned tasks, submit links, and view grades/reviews"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* TASK CARDS FEED */}
        <div className="lg:col-span-2 space-y-6">
          {tasks.length > 0 ? (
            tasks.map(task => {
              const submission = task.submissions?.[0];
              const isOverdue = new Date(task.dueDate) < new Date() && (!submission || submission.status !== 'Reviewed');
              
              return (
                <Card key={task.id} className="p-6 relative overflow-hidden group hover:scale-[1.01] transition-all duration-300" style={{ background: 'var(--card)' }}>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--foreground)' }}>{task.title}</h3>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-wider mt-1">Assigned by {task.createdBy?.name || "Mentor"}</p>
                    </div>
                    <Badge variant={task.priority === "High" ? "red" : task.priority === "Medium" ? "purple" : "success"}>
                      {task.priority} Priority
                    </Badge>
                  </div>

                  <p className="text-sm font-medium opacity-70 mb-6" style={{ color: 'var(--foreground)' }}>{task.description}</p>

                  <div className="border-t pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-1.5 text-xs font-bold opacity-60">
                        <Clock size={14} className={isOverdue ? "text-red-500" : ""} />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        {isOverdue && <span className="text-red-500 font-black uppercase text-[9px]">(Overdue)</span>}
                      </div>

                      {/* Grade Badge */}
                      {submission?.score !== undefined && submission?.score !== null && (
                        <div className="px-2.5 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-orange-500 font-black text-xs">
                          Grade: {parseFloat(submission.score)}/10
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {submission ? (
                        <div className="flex items-center gap-2">
                          <Badge variant={submission.status === 'Reviewed' ? "success" : "purple"}>
                            {submission.status === 'Reviewed' ? "GRADED & REVIEWED" : "PENDING EVALUATION"}
                          </Badge>
                          {submission.feedback && (
                            <div className="text-xs italic font-semibold opacity-60 max-w-[200px] truncate" title={submission.feedback}>
                              "{submission.feedback}"
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenSubmit(task)}
                          className="px-4 py-2.5 rounded-xl text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center gap-1.5"
                          style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}
                        >
                          <Send size={12} /> Submit Work
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="p-20 text-center opacity-40">
              <CheckSquare className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="font-black uppercase tracking-widest text-sm text-slate-900 dark:text-white">All clear! No pending tasks assigned.</p>
            </Card>
          )}
        </div>

        {/* AI INSIGHTS SIDE PANEL */}
        <div className="space-y-6">
          <Card className="p-6 relative overflow-hidden" style={{ background: 'var(--card)' }}>
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Cpu size={80} />
            </div>
            
            <div className="flex items-center gap-2 text-orange-500 mb-6">
              <Cpu size={18} />
              <h4 className="text-sm font-black uppercase tracking-widest mt-0.5">Neural Performance Analytics</h4>
            </div>

            {loadingAi ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="animate-spin text-orange-500" size={24} />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs font-bold leading-relaxed opacity-70 whitespace-pre-line" style={{ color: 'var(--foreground)' }}>
                  {aiInsights || "No active telemetry analytics found yet. File your check-ins and submit report logs to build insights."}
                </p>
                <button 
                  onClick={fetchAiInsights} 
                  className="text-[10px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-1 hover:underline"
                >
                  <RefreshCw size={10} /> Refresh AI Audit
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* SUBMISSION MODAL */}
      {showSubmitModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md p-8 relative overflow-hidden" style={{ background: 'var(--card)' }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-300" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>Task Submission</h3>
              <button onClick={() => setShowSubmitModal(false)} className="opacity-40 hover:opacity-100 transition-opacity">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold opacity-60 mb-4">Task: <span className="font-black text-slate-800 dark:text-white">{selectedTask.title}</span></p>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Submission Link / Details</label>
                <textarea
                  required
                  rows={5}
                  value={submitForm.content}
                  onChange={e => setSubmitForm({ content: e.target.value })}
                  placeholder="Provide your GitHub link, Google Drive URL, or details of completed tasks..."
                  className="w-full px-5 py-4 rounded-2xl text-sm font-bold outline-none border focus:border-orange-500"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
              
              <button 
                disabled={submitting}
                className="w-full py-4 mt-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs flex justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
                {submitting ? <Loader2 className="animate-spin text-white" size={20} /> : "Submit Assignment"}
              </button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

// Quick helper
const Loader2 = ({ className, size }) => <RefreshCw className={className} size={size} />;

export default Tasks;
