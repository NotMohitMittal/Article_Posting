import React, { useState } from "react";
import { useTodoStore } from "../context/TodoContext";
import { useThemeStore } from "../context/ThemeContext";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Trash2, Plus } from "lucide-react";

const CalendarView = () => {
  const { isDarkMode } = useThemeStore();
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodoStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTask, setNewTask] = useState("");

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const dayTodos = todos[selectedDateStr] || [];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addTodo(selectedDateStr, newTask.trim());
    setNewTask("");
  };

  const themeClasses = isDarkMode 
    ? { bg: "bg-[#121212]", border: "border-zinc-800", text: "text-zinc-200", panel: "bg-zinc-900", primary: "bg-white text-black", input: "bg-zinc-950 border-zinc-800 text-white" }
    : { bg: "bg-white", border: "border-gray-200", text: "text-gray-900", panel: "bg-gray-50", primary: "bg-black text-white", input: "bg-white border-gray-300 text-black" };

  return (
    <div className={`h-full w-full rounded-2xl border shadow-2xl flex flex-col md:flex-row overflow-hidden transition-colors ${themeClasses.bg} ${themeClasses.border} ${themeClasses.text}`}>
      
      {/* ── Left: Calendar ── */}
      <div className={`w-full md:w-1/2 p-6 md:p-8 border-b md:border-b-0 md:border-r ${themeClasses.border}`}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className={`p-2 rounded-lg border transition-colors ${themeClasses.border} hover:bg-zinc-800 hover:text-white`}><ChevronLeft size={18} /></button>
            <button onClick={handleNextMonth} className={`p-2 rounded-lg border transition-colors ${themeClasses.border} hover:bg-zinc-800 hover:text-white`}><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasTasks = todos[dateStr] && todos[dateStr].length > 0;
            const isSelected = day === selectedDate.getDate() && month === selectedDate.getMonth();

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(new Date(year, month, day))}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all border
                  ${isSelected ? themeClasses.primary : `border-transparent hover:border-zinc-500/30 ${isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-gray-200'}`}
                `}
              >
                <span className="text-sm font-semibold">{day}</span>
                {hasTasks && <span className={`w-1 h-1 rounded-full absolute bottom-2 ${isSelected ? (isDarkMode ? 'bg-black' : 'bg-white') : 'bg-zinc-500'}`} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right: To-Do List ── */}
      <div className={`w-full md:w-1/2 flex flex-col ${themeClasses.panel}`}>
        <div className={`p-6 border-b ${themeClasses.border}`}>
          <h3 className="text-xl font-bold mb-1">Tasks for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
          <p className="text-sm text-zinc-500">{dayTodos.length} items planned</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {dayTodos.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500">
              <p>No tasks for this day.</p>
            </div>
          ) : (
            dayTodos.map(task => (
              <div key={task.id} className={`flex items-center gap-3 p-4 rounded-xl border ${themeClasses.border} ${themeClasses.bg}`}>
                <button onClick={() => toggleTodo(selectedDateStr, task.id)} className="shrink-0 text-zinc-400 hover:text-green-500 transition-colors">
                  {task.completed ? <CheckCircle2 className="text-green-500" /> : <Circle />}
                </button>
                <span className={`flex-1 transition-all ${task.completed ? 'line-through opacity-40' : ''}`}>{task.text}</span>
                <button onClick={() => deleteTodo(selectedDateStr, task.id)} className="shrink-0 text-zinc-600 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddTask} className={`p-6 border-t ${themeClasses.border}`}>
          <div className="relative">
            <input 
              type="text" 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..." 
              className={`w-full pl-4 pr-12 py-3 rounded-xl border outline-none focus:border-zinc-400 transition-colors ${themeClasses.input}`} 
            />
            <button type="submit" className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg ${themeClasses.primary}`}>
              <Plus size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarView;