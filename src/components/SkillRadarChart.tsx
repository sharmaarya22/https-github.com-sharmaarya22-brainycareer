import React from 'react';

interface SkillRadarChartProps {
  requirements: string[];
  matchingSkills: string[];
  missingSkills: string[];
  jobTitle?: string;
}

export default function SkillRadarChart({
  requirements = [],
  matchingSkills = [],
  missingSkills = [],
  jobTitle = ""
}: SkillRadarChartProps) {
  // Safe Array Pre-flight guards
  const safeReqs = Array.isArray(requirements) 
    ? requirements 
    : typeof requirements === 'string'
      ? (requirements as string).split(',').map(s => s.trim()).filter(Boolean)
      : [];
  const safeMatching = Array.isArray(matchingSkills) ? matchingSkills : [];
  const safeMissing = Array.isArray(missingSkills) ? missingSkills : [];

  // Ensure we have a sensible set of skills to plot (ideally 5 to 6)
  // We'll extract and truncate the requirements, ensuring we have between 4 and 7 dimensions
  const rawSkills = safeReqs.length > 0 ? safeReqs : ['Coding', 'System Design', 'Communication', 'Collaborative', 'Tooling'];
  
  // Truncate and clean skill names for clean display labels
  const axisSkills = rawSkills.map(s => {
    let cleaned = s.replace(/experience/gi, '').replace(/skills/gi, '').trim();
    if (cleaned.length > 14) {
      cleaned = cleaned.substring(0, 12) + '...';
    }
    return cleaned || s.substring(0, 12);
  }).slice(0, 6);

  // If we have less than 4 skills, we pad them to make a stable radar polygon
  const minAxes = 4;
  while (axisSkills.length < minAxes) {
    axisSkills.push(`Requirement ${axisSkills.length + 1}`);
  }

  const numAxes = axisSkills.length;
  const size = 260;
  const center = size / 2;
  const radius = center - 45; // Leave space for labels

  // Trigonometric coordinates helper
  const getCoordinatesForValue = (index: number, score: number) => {
    // 0 is top
    const angle = (2 * Math.PI * index) / numAxes - Math.PI / 2;
    const factor = score / 100;
    const x = center + radius * factor * Math.cos(angle);
    const y = center + radius * factor * Math.sin(angle);
    return { x, y };
  };

  // 1. Candidate's skill values:
  // If the skill (axisSkill) is matched, candidate gets a high score (95). 
  // If it's missing, candidate gets a lower baseline score (25).
  // This provides clear, visual high-contrast representation.
  const candidateScores = axisSkills.map((axisSkill, idx) => {
    // Match against user matchingSkills or missingSkills
    const lowerAxis = axisSkill.toLowerCase();
    
    const isMatching = safeMatching.some(m => m.toLowerCase().includes(lowerAxis) || lowerAxis.includes(m.toLowerCase())) ||
                       (safeReqs[idx] && safeMatching.some(m => m.toLowerCase().includes(safeReqs[idx].toLowerCase())));
    
    return isMatching ? 95 : 25;
  });

  // 2. Job's standard values:
  // These represent the target baseline of 100% for each axis
  const targetScores = axisSkills.map(() => 95);

  // Math coordinate lists for svg polygons
  const candidateCoords = candidateScores.map((score, idx) => getCoordinatesForValue(idx, score));
  const targetCoords = targetScores.map((score, idx) => getCoordinatesForValue(idx, score));

  const candidatePolygonPoints = candidateCoords.map(c => `${c.x},${c.y}`).join(' ');
  const targetPolygonPoints = targetCoords.map(c => `${c.x},${c.y}`).join(' ');

  // Radial grid levels
  const levels = [25, 50, 75, 100];

  return (
    <div id="skills-radar-card" className="bg-[#0b0f19]/80 border border-white/5 rounded-2xl p-4.5 flex flex-col items-center select-none">
      <div className="w-full flex items-center justify-between mb-3 text-[10px]">
        <span className="uppercase tracking-widest text-slate-400 font-bold">Fit Coverage Radar</span>
        <span className="text-cyan-400 font-bold uppercase font-mono">VS ROLE DEMANDS</span>
      </div>

      <div className="relative">
        <svg width={size} height={size} className="overflow-visible">
          {/* Radial concentric grid polygons */}
          {levels.map((level, lvlIdx) => {
            const levelPoints = axisSkills.map((_, idx) => {
              const coords = getCoordinatesForValue(idx, level);
              return `${coords.x},${coords.y}`;
            }).join(' ');

            return (
              <polygon
                key={level}
                points={levelPoints}
                className={`fill-none stroke-white/${lvlIdx === levels.length - 1 ? '10' : '5'} stroke-[0.5]`}
                strokeDasharray={lvlIdx < levels.length - 1 ? "1 2" : "none"}
              />
            );
          })}

          {/* Web spider Axes lines */}
          {axisSkills.map((_, idx) => {
            const edge = getCoordinatesForValue(idx, 100);
            return (
              <line
                key={idx}
                x1={center}
                y1={center}
                x2={edge.x}
                y2={edge.y}
                className="stroke-white/5 stroke-[0.5]"
              />
            );
          })}

          {/* Target Requirement Polygon (Outer boundary) */}
          <polygon
            points={targetPolygonPoints}
            className="fill-purple-500/5 stroke-purple-500/20 stroke-[1.5] stroke-dasharray-[2_2]"
          />

          {/* Candidate Profile Polygon */}
          <polygon
            points={candidatePolygonPoints}
            className="fill-cyan-400/20 stroke-cyan-400 stroke-2 filter drop-shadow-[0_0_4px_rgba(34,211,238,0.2)] transition-all duration-700"
          />

          {/* Candidate Data points pin */}
          {candidateCoords.map((c, idx) => (
            <circle
              key={idx}
              cx={c.x}
              cy={c.y}
              r="3.5"
              className={`${candidateScores[idx] > 50 ? 'fill-cyan-400' : 'fill-slate-500'} stroke-slate-900 stroke-[1.5] transition-all duration-700`}
            />
          ))}

          {/* Label positioning with offsets for axis readability */}
          {axisSkills.map((skill, idx) => {
            const edge = getCoordinatesForValue(idx, 100);
            const isLeft = edge.x < center - 5;
            const isRight = edge.x > center + 5;
            const isTop = edge.y < center - 5;
            const isBottom = edge.y > center + 5;

            let textAnchor = "middle";
            if (isLeft) textAnchor = "end";
            if (isRight) textAnchor = "start";

            let dy = "0.32em";
            if (isTop && !isLeft && !isRight) dy = "-0.6em";
            if (isBottom && !isLeft && !isRight) dy = "1em";

            return (
              <text
                key={idx}
                x={edge.x + (isLeft ? -5 : isRight ? 5 : 0)}
                y={edge.y}
                dy={dy}
                textAnchor={textAnchor}
                className="fill-slate-400 font-mono text-[9px] font-medium"
              >
                {skill}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legends for Chart Area */}
      <div className="flex gap-4 mt-3 text-[10px] font-semibold">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
          </span>
          <span>Your Resume</span>
        </div>
        <div className="flex items-center gap-1.5 text-purple-400">
          <span className="w-2.5 h-2.5 rounded bg-purple-500/5 border border-purple-500/30 border-dashed"></span>
          <span>Role Benchmark</span>
        </div>
      </div>
    </div>
  );
}
