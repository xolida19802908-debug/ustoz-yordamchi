import React, { useState } from 'react';
import {
  FolderHeart,
  Search,
  BookOpen,
  FileCheck2,
  HelpCircle,
  Home,
  Sparkles,
  Award,
  Trash2,
  Printer,
  Copy,
  Download,
  Upload,
  ArrowRight,
  Eye,
  Calendar,
} from 'lucide-react';
import { SavedMaterial, MaterialType } from '../types';
import { useToast } from '../components/Toast';
import { exportMaterialsAsJSON, importMaterialsFromJSON } from '../utils/storage';
import { ActiveTab } from '../components/Sidebar';

interface Props {
  materials: SavedMaterial[];
  onOpenMaterial: (material: SavedMaterial) => void;
  onDeleteMaterial: (id: string) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const SavedMaterialsView: React.FC<Props> = ({
  materials,
  onOpenMaterial,
  onDeleteMaterial,
  onNavigateTab,
}) => {
  const { showToast } = useToast();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'Barchasi', count: materials.length },
    { id: 'lesson', label: 'Darslar', count: materials.filter((m) => m.type === 'lesson').length },
    { id: 'test', label: 'Testlar', count: materials.filter((m) => m.type === 'test').length },
    { id: 'questions', label: 'Savollar', count: materials.filter((m) => m.type === 'questions').length },
    { id: 'homework', label: 'Uy vazifalari', count: materials.filter((m) => m.type === 'homework').length },
    { id: 'explainer', label: 'Tushuntirishlar', count: materials.filter((m) => m.type === 'explainer').length },
  ];

  // Filtering
  const filtered = materials.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.type === activeCategory;
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleExport = () => {
    const json = exportMaterialsAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ustoz_ai_saqlangan_materiallar_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('✓ Zaxira nusxasi yuklab olindi', 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importMaterialsFromJSON(content);
        if (success) {
          showToast('✓ Materiallar muvaffaqiyatli tiklandi!', 'success');
          window.location.reload();
        } else {
          showToast('Fayl formati noto‘g‘ri', 'error');
        }
      }
    };
    reader.readAsText(file);
  };

  const getIconForType = (type: MaterialType) => {
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

  const getTypeLabel = (type: MaterialType) => {
    switch (type) {
      case 'lesson':
        return 'Dars ishlanmasi';
      case 'test':
        return 'Darslik testi';
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FolderHeart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-heading text-slate-900">
              Saqlangan o‘quv-uslubiy materiallar
            </h2>
            <p className="text-xs text-slate-500">
              Jami {materials.length} ta material saqlangan. Hech qachon o‘chib ketmaydi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all"
            title="Barcha materiallarni JSON fayl qilib yuklash"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Nusxa olish (JSON)</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Yuklash</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Categories Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Materiallar orasidan qidirish..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Materials Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-200 text-center space-y-3">
          <FolderHeart className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">
            {searchQuery
              ? `"${searchQuery}" bo‘yicha material topilmadi`
              : 'Saqlangan materiallar hozircha yo‘q.'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'Qidiruv so‘zini o‘zgartirib ko‘ring yoki barcha toifalarni oching.'
              : 'Dars, test yoki uy vazifasini yaratib "Saqlash" tugmasini bosing.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => onNavigateTab('lesson')}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Birinchi darsingizni yaratib ko‘ring</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                      {getIconForType(item.type)}
                    </div>
                    <span className="text-[11px] font-bold text-slate-600">
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {item.grade}-sinf
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1 mb-3">
                  Fan: {item.subject}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(item.createdAt).toLocaleDateString('uz-UZ')}</span>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenMaterial(item)}
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 transition-colors"
                    title="Ochish / Ko‘rish"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      onOpenMaterial(item);
                      setTimeout(() => window.print(), 300);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                    title="Chop etish"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`"${item.title}" materialini o‘chirishni tasdiqlaysizmi?`)) {
                        onDeleteMaterial(item.id);
                        showToast('✓ O‘chirildi', 'info');
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    title="O‘chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
