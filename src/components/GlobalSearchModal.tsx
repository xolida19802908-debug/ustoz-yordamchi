import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, FileCheck2, Home, HelpCircle, Sparkles, Award, ArrowRight } from 'lucide-react';
import { SavedMaterial } from '../types';
import { ActiveTab } from './Sidebar';
import { SUBJECTS, OFFICIAL_TEXTBOOKS } from '../data/textbooks';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  savedMaterials: SavedMaterial[];
  onSelectMaterial: (material: SavedMaterial) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const GlobalSearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  savedMaterials,
  onSelectMaterial,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggling
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalized = query.toLowerCase().trim();

  // Search filtered saved materials
  const matchedSaved = savedMaterials.filter(
    (m) =>
      m.title.toLowerCase().includes(normalized) ||
      m.subject.toLowerCase().includes(normalized) ||
      m.topic.toLowerCase().includes(normalized) ||
      `${m.grade}`.includes(normalized)
  );

  // Search filtered textbook topics
  const matchedTextbookTopics: { subject: string; grade: number; chapter: string; topic: string; page: number }[] = [];
  if (normalized.length >= 2) {
    OFFICIAL_TEXTBOOKS.forEach((tb) => {
      tb.chapters.forEach((ch) => {
        ch.topics.forEach((top) => {
          if (
            top.title.toLowerCase().includes(normalized) ||
            ch.title.toLowerCase().includes(normalized) ||
            tb.subjectName.toLowerCase().includes(normalized)
          ) {
            matchedTextbookTopics.push({
              subject: tb.subjectName,
              grade: tb.grade,
              chapter: ch.title,
              topic: top.title,
              page: top.page,
            });
          }
        });
      });
    });
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'lesson':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case 'test':
        return <FileCheck2 className="w-4 h-4 text-blue-600" />;
      case 'homework':
        return <Home className="w-4 h-4 text-amber-600" />;
      case 'questions':
        return <HelpCircle className="w-4 h-4 text-purple-600" />;
      case 'explainer':
        return <Sparkles className="w-4 h-4 text-teal-600" />;
      default:
        return <Award className="w-4 h-4 text-rose-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lesson':
        return 'Dars ishlanmasi';
      case 'test':
        return 'Test';
      case 'homework':
        return 'Uy vazifasi';
      case 'questions':
        return 'Savollar';
      case 'explainer':
        return 'Tushuntirish';
      default:
        return 'Baholash';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Fan, mavzu, sinf yoki darslik bo‘yicha qidiring..."
            className="flex-1 bg-transparent text-sm md:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg"
          >
            Esc
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Quick Actions Shortcuts */}
          {!query && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Tezkor o‘tish
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    onNavigateTab('lesson');
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 text-left transition-all text-xs font-medium text-slate-700"
                >
                  <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dars yaratish</span>
                </button>
                <button
                  onClick={() => {
                    onNavigateTab('test');
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 text-left transition-all text-xs font-medium text-slate-700"
                >
                  <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Test yaratish</span>
                </button>
                <button
                  onClick={() => {
                    onNavigateTab('interactive');
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 text-left transition-all text-xs font-medium text-slate-700"
                >
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Interaktiv mashq</span>
                </button>
              </div>
            </div>
          )}

          {/* Matched Saved Materials */}
          {matchedSaved.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Saqlangan materiallar ({matchedSaved.length})
              </p>
              <div className="space-y-1.5">
                {matchedSaved.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectMaterial(item);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-white shrink-0 border border-slate-100">
                        {getIconForType(item.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.grade}-sinf · {item.subject} · {getTypeLabel(item.type)}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Textbook Chapters */}
          {matchedTextbookTopics.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Darslik mavzulari ({matchedTextbookTopics.length})
              </p>
              <div className="space-y-1.5">
                {matchedTextbookTopics.slice(0, 6).map((topicItem, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onNavigateTab('test');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer text-left transition-all group"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {topicItem.topic}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {topicItem.grade}-sinf {topicItem.subject} · {topicItem.page}-bet
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Darslik
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty search state */}
          {query && matchedSaved.length === 0 && matchedTextbookTopics.length === 0 && (
            <div className="text-center py-10">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                "{query}" bo‘yicha natija topilmadi
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Boshqa kalit so‘z yoki fanni kiritib ko‘ring.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
