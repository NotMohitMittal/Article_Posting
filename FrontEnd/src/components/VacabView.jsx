import React, { useState } from "react";
import { useVocabStore } from "../context/VocabContext";
import { useThemeStore } from "../context/ThemeContext";
import { BookA, Trash2, Plus, Languages } from "lucide-react";

const VocabView = () => {
  const { isDarkMode } = useThemeStore();
  const { vocabulary, addWord, deleteWord } = useVocabStore();

  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) return;
    addWord(word.trim(), meaning.trim());
    setWord("");
    setMeaning("");
  };

  const themeClasses = isDarkMode
    ? {
        bg: "bg-[#121212]",
        border: "border-zinc-800",
        text: "text-zinc-200",
        panel: "bg-zinc-900",
        primary: "bg-white text-black",
        input:
          "bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600",
      }
    : {
        bg: "bg-white",
        border: "border-gray-200",
        text: "text-gray-900",
        panel: "bg-gray-50",
        primary: "bg-black text-white",
        input: "bg-white border-gray-300 text-black placeholder:text-gray-400",
      };

  return (
    <div
      className={`h-full w-full rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-colors ${themeClasses.bg} ${themeClasses.border} ${themeClasses.text}`}
    >
      {/* Header & Add Form */}
      <div
        className={`p-6 md:p-8 border-b ${themeClasses.border} ${themeClasses.panel}`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${themeClasses.primary}`}
          >
            <Languages size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vocabulary</h1>
            <p className="text-sm opacity-60">
              Save words and idioms to expand your knowledge.
            </p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Word or Idiom"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            className={`flex-1 px-4 py-3 rounded-xl border outline-none focus:border-zinc-400 transition-colors ${themeClasses.input}`}
          />
          <input
            type="text"
            placeholder="Meaning / Definition"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            className={`flex-[2] px-4 py-3 rounded-xl border outline-none focus:border-zinc-400 transition-colors ${themeClasses.input}`}
          />
          <button
            type="submit"
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-transform active:scale-95 ${themeClasses.primary}`}
          >
            <Plus size={18} /> Add Word
          </button>
        </form>
      </div>

      {/* Dictionary List */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {vocabulary.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <BookA size={48} className="mb-4" />
            <p className="font-medium text-lg">Your dictionary is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {vocabulary.map((item) => (
              <div
                key={item.id}
                className={`group flex flex-col md:flex-row md:items-center p-5 rounded-xl border transition-all hover:border-zinc-500/50 ${themeClasses.border} ${themeClasses.bg}`}
              >
                <div className="w-1/3 font-bold text-lg mb-1 md:mb-0 pr-4">
                  {item.word}
                </div>
                <div className="flex-1 flex items-center gap-2 text-zinc-500 before:hidden md:before:block before:content-['—'] before:mr-2">
                  <span
                    className={isDarkMode ? "text-zinc-300" : "text-gray-700"}
                  >
                    {item.meaning}
                  </span>
                </div>
                <button
                  onClick={() => deleteWord(item.id)}
                  className="absolute right-6 opacity-0 group-hover:opacity-100 p-2 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                  title="Delete word"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VocabView;
