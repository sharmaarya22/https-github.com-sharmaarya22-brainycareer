import React, { useState } from 'react';
import { Preferences } from '../types';
import { Save, Sliders, Briefcase, DollarSign, MapPin, Layers, X, Plus } from 'lucide-react';

interface PreferencesFormProps {
  initialPreferences?: Preferences;
  onSave: (preferences: Preferences) => Promise<void>;
  isLoading?: boolean;
}

export default function PreferencesForm({ initialPreferences, onSave, isLoading = false }: PreferencesFormProps) {
  const [desiredRole, setDesiredRole] = useState(initialPreferences?.desiredRole || 'Fullstack Engineer');
  const [industry, setIndustry] = useState(initialPreferences?.industry || 'Tech / SaaS');
  const [experienceLevel, setExperienceLevel] = useState<Preferences['experienceLevel']>(initialPreferences?.experienceLevel || 'Mid');
  const [locationModel, setLocationModel] = useState<Preferences['locationModel']>(initialPreferences?.locationModel || 'Remote');
  const [minSalary, setMinSalary] = useState(initialPreferences?.minSalary || 100000);
  const [preferredLocation, setPreferredLocation] = useState(initialPreferences?.preferredLocation || 'Remote');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(initialPreferences?.skills || ['React', 'TypeScript', 'Node.js']);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      desiredRole,
      industry,
      experienceLevel,
      locationModel,
      minSalary: Number(minSalary),
      preferredLocation,
      skills
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-white/5">
        <Sliders className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Set Career Target preferences</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
            Desired Role Title
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              required
              value={desiredRole}
              onChange={(e) => setDesiredRole(e.target.value)}
              className="w-full bg-slate-900/60 pl-9 pr-3 py-2 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
              placeholder="e.g. Lead AI Specialist"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
            Target Industry
          </label>
          <div className="relative">
            <Layers className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              required
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full bg-slate-900/60 pl-9 pr-3 py-2 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
              placeholder="e.g. Healthcare FinTech"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
            Target Experience Level
          </label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value as Preferences['experienceLevel'])}
            className="w-full bg-slate-900/60 px-3 py-2 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
          >
            <option value="All">All Experience levels</option>
            <option value="Entry">Entry Level</option>
            <option value="Mid">Mid Level</option>
            <option value="Senior">Senior Professional</option>
            <option value="Lead">Lead / Executive</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
            Work Model Preference
          </label>
          <select
            value={locationModel}
            onChange={(e) => setLocationModel(e.target.value as Preferences['locationModel'])}
            className="w-full bg-slate-900/60 px-3 py-2 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
          >
            <option value="All">Any Model</option>
            <option value="Remote">Remote Worldwide</option>
            <option value="Hybrid">Hybrid Office</option>
            <option value="Onsite">On-site Mandatory</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
            Preferred Location Target
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
              className="w-full bg-slate-900/60 pl-9 pr-3 py-2 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
              placeholder="e.g. San Francisco, Remote"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
            Min Salary Requirement (Yr)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(Number(e.target.value))}
              className="w-full bg-slate-900/60 pl-9 pr-3 py-2 border border-white/10 rounded-xl text-xs font-mono text-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
              placeholder="e.g. 120000"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
          Desired Technical Skills / Keyword Targets
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            className="flex-1 bg-slate-900/60 px-3 py-1.5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-650"
            placeholder="Add e.g. PyTorch, Kubernetes"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill(e);
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-950/20 rounded-lg">
          {skills.length === 0 ? (
            <span className="text-[10px] font-medium text-slate-600 p-1">No preferences configured. Include targets to focus AI matches.</span>
          ) : (
            skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded-lg border border-cyan-500/20"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="p-0.5 hover:bg-cyan-500/20 rounded text-cyan-400/65 hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      <button
        id="save-preferences-btn"
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl text-xs tracking-wide transition-all shadow-md shadow-cyan-950/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Saving Settings...</span>
          </>
        ) : (
          <>
            <Save className="w-3.5 h-3.5 text-slate-950" />
            Save Preferences
          </>
        )}
      </button>
    </form>
  );
}
