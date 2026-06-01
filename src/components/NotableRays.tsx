import React, { useState } from 'react';
import { Settings2, Eye, EyeOff, RefreshCw, ZoomIn } from 'lucide-react';

interface NotableRaysLensProps {
  isConvex: boolean;
  focalLength: number;
  visibleRays: {
    ray1: boolean;
    ray2: boolean;
    ray3: boolean;
    ray4: boolean;
  };
  title: string;
}

function NotableRaysLens({ isConvex, focalLength, visibleRays, title }: NotableRaysLensProps) {
  const width = 600;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // focalLength is positive for converging, negative for diverging in physics convention
  // but here we'll use the absolute value and handle the logic based on isConvex
  const f = Math.abs(focalLength);
  const A = 2 * f; // Antiprincipal point

  // Points on the axis
  // For converging: F and A are on both sides.
  // F_obj is on the left, F_img is on the right.
  // For diverging: F_img is on the left, F_obj is on the right.
  
  const fObjX = isConvex ? centerX - f : centerX + f;
  const fImgX = isConvex ? centerX + f : centerX - f;
  const aObjX = isConvex ? centerX - A : centerX + A;
  const aImgX = isConvex ? centerX + A : centerX - A;

  const renderRay = (points: {x: number, y: number}[], color: string, visible: boolean, projections?: {x: number, y: number}[][]) => {
    if (!visible) return null;
    return (
      <g>
        {/* Projections (Dotted lines) */}
        {projections?.map((proj, idx) => (
          <polyline
            key={`proj-${idx}`}
            points={proj.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.6"
          />
        ))}
        
        <polyline
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Arrows */}
        {points.slice(0, -1).map((p, i) => {
          const nextP = points[i+1];
          const angle = Math.atan2(nextP.y - p.y, nextP.x - p.x) * 180 / Math.PI;
          const midX = (p.x + nextP.x) / 2;
          const midY = (p.y + nextP.y) / 2;
          return (
            <path
              key={i}
              d="M -6 -4 L 2 0 L -6 4 Z"
              fill={color}
              transform={`translate(${midX}, ${midY}) rotate(${angle})`}
            />
          );
        })}
      </g>
    );
  };

  // Ray 1: Parallel -> Focus Image
  const y1 = centerY - 60;
  const m1 = (centerY - y1) / (fImgX - centerX);
  const ray1Points = [
    { x: 0, y: y1 },
    { x: centerX, y: y1 },
    { x: width, y: y1 + m1 * (width - centerX) }
  ];
  const ray1Projections = !isConvex ? [[{ x: fImgX, y: centerY }, { x: centerX, y: y1 }]] : [];

  // Ray 2: Through Vertex -> No deviation
  const y2Start = centerY + 40;
  const m2 = (centerY - y2Start) / (centerX - 0);
  const ray2Points = [
    { x: 0, y: y2Start },
    { x: centerX, y: centerY },
    { x: width, y: centerY + m2 * (width - centerX) }
  ];

  // Ray 3: Through Focus Object -> Parallel
  const y3End = centerY + 60;
  const m3 = (y3End - centerY) / (centerX - fObjX);
  const y3Start = y3End - m3 * centerX;
  const ray3Points = [
    { x: 0, y: y3Start },
    { x: centerX, y: y3End },
    { x: width, y: y3End }
  ];
  const ray3Projections = !isConvex ? [[{ x: centerX, y: y3End }, { x: fObjX, y: centerY }]] : [];

  // Ray 4: Through Antiprincipal Object -> Antiprincipal Image
  const y4Hit = centerY + 90;
  const m4In = (y4Hit - centerY) / (centerX - aObjX);
  const y4Start = y4Hit - m4In * centerX;
  const m4Out = (y4Hit - centerY) / (centerX - aImgX);
  const ray4Points = [
    { x: 0, y: y4Start },
    { x: centerX, y: y4Hit },
    { x: width, y: y4Hit + m4Out * (width - centerX) }
  ];
  const ray4Projections = !isConvex 
    ? [[{ x: centerX, y: y4Hit }, { x: aObjX, y: centerY }], [{ x: aImgX, y: centerY }, { x: centerX, y: y4Hit }]] 
    : [];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative flex-1">
      <div className="absolute top-4 left-6 z-10 flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600">
          <ZoomIn size={14} />
          <span>{title}</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-slate-50">
        <defs>
          <pattern id={`grid-notable-${isConvex ? 'conv' : 'div'}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-notable-${isConvex ? 'conv' : 'div'})`} />

        {/* Optical Axis */}
        <line x1="0" y1={centerY} x2={width} y2={centerY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />

        {/* Focal and Antiprincipal Points */}
        {[
          { x: fObjX, label: isConvex ? 'F' : "F'" },
          { x: fImgX, label: isConvex ? "F'" : 'F' },
          { x: aObjX, label: isConvex ? 'A' : "A'" },
          { x: aImgX, label: isConvex ? "A'" : 'A' }
        ].map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={centerY} r="3" fill="#475569" />
            <text x={p.x} y={centerY + 20} textAnchor="middle" className="text-[10px] font-bold fill-slate-500">{p.label}</text>
          </g>
        ))}

        {/* Lens Notation */}
        <line x1={centerX} y1={50} x2={centerX} y2={height - 50} stroke="#334155" strokeWidth="2" />
        {isConvex ? (
          <>
            <path d={`M ${centerX-10} 60 L ${centerX} 50 L ${centerX+10} 60`} fill="none" stroke="#334155" strokeWidth="2" />
            <path d={`M ${centerX-10} ${height-60} L ${centerX} ${height-50} L ${centerX+10} ${height-60}`} fill="none" stroke="#334155" strokeWidth="2" />
          </>
        ) : (
          <>
            <path d={`M ${centerX-10} 50 L ${centerX} 60 L ${centerX+10} 50`} fill="none" stroke="#334155" strokeWidth="2" />
            <path d={`M ${centerX-10} ${height-50} L ${centerX} ${height-60} L ${centerX+10} ${height-50}`} fill="none" stroke="#334155" strokeWidth="2" />
          </>
        )}

        {/* Rays */}
        {renderRay(ray1Points, "#f97316", visibleRays.ray1, ray1Projections)} {/* Orange */}
        {renderRay(ray2Points, "#a855f7", visibleRays.ray2)} {/* Purple */}
        {renderRay(ray3Points, "#22c55e", visibleRays.ray3, ray3Projections)} {/* Green */}
        {renderRay(ray4Points, "#3b82f6", visibleRays.ray4, ray4Projections)} {/* Blue */}
      </svg>
    </div>
  );
}

export default function NotableRays() {
  const [visibleRays, setVisibleRays] = useState({
    ray1: true,
    ray2: true,
    ray3: true,
    ray4: true
  });

  const toggleRay = (ray: keyof typeof visibleRays) => {
    setVisibleRays(prev => ({ ...prev, [ray]: !prev[ray] }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <aside className="lg:col-span-1 space-y-6">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-4">
            <Settings2 size={20} className="text-blue-600" />
            <h2>Raios Notáveis</h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => toggleRay('ray1')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold transition-all border ${
                visibleRays.ray1 ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                Paralelo → Foco Imagem
              </span>
              {visibleRays.ray1 ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>

            <button
              onClick={() => toggleRay('ray2')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold transition-all border ${
                visibleRays.ray2 ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                Vértice (Sem desvio)
              </span>
              {visibleRays.ray2 ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>

            <button
              onClick={() => toggleRay('ray3')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold transition-all border ${
                visibleRays.ray3 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                Foco Objeto → Paralelo
              </span>
              {visibleRays.ray3 ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>

            <button
              onClick={() => toggleRay('ray4')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold transition-all border ${
                visibleRays.ray4 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                Antiprincipal → Antiprincipal
              </span>
              {visibleRays.ray4 ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>

          <button 
            onClick={() => setVisibleRays({ ray1: true, ray2: true, ray3: true, ray4: true })}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RefreshCw size={16} />
            Resetar Visibilidade
          </button>
        </section>
      </aside>

      <div className="lg:col-span-3 flex flex-col gap-6">
        <NotableRaysLens 
          isConvex={true} 
          focalLength={120} 
          visibleRays={visibleRays} 
          title="Lente Convergente (Notação)" 
        />
        <NotableRaysLens 
          isConvex={false} 
          focalLength={120} 
          visibleRays={visibleRays} 
          title="Lente Divergente (Notação)" 
        />
      </div>
    </div>
  );
}
