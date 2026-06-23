import { useState, useEffect } from "react";
import { Search, BookOpen, ChevronRight, ChevronLeft, FileText, ShieldCheck } from "lucide-react";
import { Card, Badge, PrimaryButton } from "../../shared/components/UI";
import api from "../../utils/api";

const KnowledgeBase = () => {
  const [courses, setCourses] = useState([]);
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [viewTab, setViewTab] = useState("Courses"); // Courses or Articles
  const [enrolledIds, setEnrolledIds] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, enrollRes, articleRes] = await Promise.all([
          api.get('/courses'),
          api.get('/enrollments/me'),
          api.get('/articles')
        ]);
        
        if (courseRes.data.success) setCourses(courseRes.data.data);
        if (articleRes.data.success) setArticles(articleRes.data.data);
        if (enrollRes.data.success) {
          const ids = new Set(enrollRes.data.data.map(e => e.courseId));
          setEnrolledIds(ids);
        }
      } catch (err) {
        console.error("Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      const res = await api.post('/enrollments', { courseId });
      if (res.data.success) {
        setEnrolledIds(prev => new Set([...prev, courseId]));
        alert("Enrollment successful. Unit unlocked!");
      }
    } catch (err) {
      alert("Enrollment rejected");
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase())
  );
  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedCourse) {
    return (
      <div className="animate-in fade-in slide-in-from-left-4 duration-500 pb-12">
        <button onClick={() => setSelectedCourse(null)} className="flex items-center gap-2 text-sm mb-6 font-black uppercase tracking-widest text-orange-500">
          <ChevronLeft size={16} /> Back to Library
        </button>
        <div className="max-w-4xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-4">{selectedCourse.title}</h1>
          <p className="text-lg opacity-60 mb-8">{selectedCourse.description}</p>
          <Card className="p-6 sm:p-8">
            <h3 className="font-black uppercase tracking-widest text-orange-500 mb-6">Course Syllabus</h3>
            <div className="space-y-3">
              {selectedCourse.lessons?.map(l => (
                <div key={l.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="font-black text-sm">{l.title}</span>
                  <Badge variant="gray">Sequence {l.order}</Badge>
                </div>
              ))}
            </div>
            {!enrolledIds.has(selectedCourse.id) && (
              <PrimaryButton onClick={() => handleEnroll(selectedCourse.id)} className="mt-10 w-full py-5 text-sm uppercase tracking-widest font-black">
                Initialize Enrollment
              </PrimaryButton>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white mb-2 uppercase">Intelligence Repository</h1>
          <p className="text-slate-400 text-sm font-black uppercase tracking-widest mb-8 opacity-60">Training, Documentation & Operational Assets</p>
          <div className="relative max-w-xl mx-auto flex gap-3">
             <div className="relative flex-1">
                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Query system archives..."
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-white outline-none font-bold"
                />
             </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        {["Courses", "Resources"].map(tab => (
          <button 
            key={tab} 
            onClick={() => setViewTab(tab)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewTab === tab ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'bg-slate-50 dark:bg-slate-800 opacity-60'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {viewTab === "Courses" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <Card key={course.id} hover className="p-6 flex flex-col group border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
                <BookOpen size={20} className="text-orange-500" />
              </div>
              <h3 className="text-lg font-black tracking-tight leading-snug mb-3 flex-1">{course.title}</h3>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-50 mb-6">{course.lessons?.length || 0} Modules</p>
              
              <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800">
                <Badge variant={enrolledIds.has(course.id) ? "success" : "warning"}>
                  {enrolledIds.has(course.id) ? "✓ ENROLLED" : "OPEN"}
                </Badge>
                <button 
                  onClick={() => setSelectedCourse(course)}
                  className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-blue-500 hover:gap-4 transition-all"
                >
                  View Details <ChevronRight size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(article => (
            <Card key={article.id} hover className="p-6 flex flex-col border-emerald-500/10 bg-emerald-500/[0.02]">
               <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mb-6 text-emerald-500">
                 <FileText size={20} />
               </div>
               <h3 className="text-lg font-black tracking-tight leading-snug mb-2">{article.title}</h3>
               <div className="flex items-center gap-4 mt-auto pt-6 border-t border-emerald-100 dark:border-emerald-900/30">
                  <Badge variant="gray">{article.category}</Badge>
                  {article.verified && <span className="flex items-center gap-1.5 text-[8px] font-black text-emerald-500"><ShieldCheck size={12} /> VERIFIED</span>}
               </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && (viewTab === "Courses" ? filteredCourses : filteredArticles).length === 0 && (
        <div className="text-center py-24 opacity-20"><Search size={60} className="mx-auto mb-4" /><p className="font-black uppercase tracking-widest">No Intelligence Matches</p></div>
      )}
    </div>
  );
};

export default KnowledgeBase;