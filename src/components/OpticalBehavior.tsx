import React, { useState, useMemo } from 'react';
import { Settings2, Info, ZoomIn, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface LensProps {
  nMedium: number;
  nLens: number;
  radius: number;
  rayOffset: number;
  isConvex: boolean;
  title: string;
  showIncident: boolean;
  showRefracted: boolean;
}

function LensSimulation({ nMedium, nLens, radius, rayOffset, isConvex, title, showIncident, showRefracted }: LensProps) {
  const width = 400;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;

  const lensThickness = 60;
  const lensHeight = 400;
  
  const xFlat = centerX - lensThickness / 2;
  const xSurfaceAtCenter = centerX + lensThickness / 2;
  const xCenterCurvature = isConvex 
    ? xSurfaceAtCenter - radius 
    : xSurfaceAtCenter + radius;

  const calculateRay = (offset: number) => {
    const yRay = centerY + offset;
    const dy = yRay - centerY;
    
    // Determine the actual height of the lens at this radius
    let h = lensHeight / 2;
    const dxFlat = xFlat - xCenterCurvature;
    if (isConvex && dxFlat > 0 && dxFlat < radius) {
      const maxH = Math.sqrt(radius * radius - dxFlat * dxFlat);
      h = Math.min(h, maxH);
    }
    
    if (Math.abs(dy) > h || Math.abs(dy) > radius) return null;

    // Intersection with curved face
    // (x - xCenterCurvature)^2 + dy^2 = radius^2
    const dxCurved = Math.sqrt(radius * radius - dy * dy);
    const xIntersect = isConvex 
      ? xCenterCurvature + dxCurved 
      : xCenterCurvature - dxCurved;

    const p1 = { x: 0, y: yRay };
    const p2 = { x: xFlat, y: yRay };
    const p3 = { x: xIntersect, y: yRay };
    
    // Refraction at curved face
    const alpha = Math.atan2(dy, xIntersect - xCenterCurvature);
    const normalAngle = isConvex ? alpha : alpha + Math.PI;
    
    const theta1 = 0 - normalAngle;
    const sinTheta2 = (nLens / nMedium) * Math.sin(theta1);
    
    if (Math.abs(sinTheta2) > 1) {
      return { points: [p1, p2, p3], isTIR: true };
    }
    
    const theta2 = Math.asin(sinTheta2);
    const rayAngle = normalAngle + theta2;
    
    const rayLength = 300;
    const p4 = {
      x: xIntersect + Math.cos(rayAngle) * rayLength,
      y: yRay + Math.sin(rayAngle) * rayLength
    };
    
    return {
      points: [p1, p2, p3, p4],
      isTIR: false,
      focalPoint: xIntersect + (centerY - yRay) / Math.tan(rayAngle)
    };
  };

  const rayTop = useMemo(() => calculateRay(-rayOffset), [nMedium, nLens, radius, rayOffset, isConvex]);
  const rayBottom = useMemo(() => calculateRay(rayOffset), [nMedium, nLens, radius, rayOffset, isConvex]);

  const getLensPath = () => {
    let h = lensHeight / 2;
    const dxFlat = xFlat - xCenterCurvature;
    
    if (isConvex && dxFlat > 0 && dxFlat < radius) {
      const maxH = Math.sqrt(radius * radius - dxFlat * dxFlat);
      h = Math.min(h, maxH);
    }
    
    const dxCurved = Math.sqrt(radius * radius - h * h);
    const xCurvedEdge = isConvex 
      ? xCenterCurvature + dxCurved 
      : xCenterCurvature - dxCurved;
    
    const sweepFlag = isConvex ? 0 : 1;
    
    return `M ${xFlat} ${centerY - h} 
            L ${xFlat} ${centerY + h} 
            L ${xCurvedEdge} ${centerY + h} 
            A ${radius} ${radius} 0 0 ${sweepFlag} ${xCurvedEdge} ${centerY - h}
            Z`;
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative flex-1">
      <div className="absolute top-4 left-6 z-10 flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600">
          <ZoomIn size={14} />
          <span>{title}</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto bg-slate-50"
      >
        <defs>
          <pattern id={`grid-${isConvex ? 'convex' : 'concave'}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${isConvex ? 'convex' : 'concave'})`} />

        <line x1="0" y1={centerY} x2={width} y2={centerY} stroke="#000000" strokeWidth="2" />

        <path
          d={getLensPath()}
          fill="rgba(59, 130, 246, 0.1)"
          stroke="#3b82f6"
          strokeWidth="2"
        />

        {[rayTop, rayBottom].map((ray, idx) => (
          ray && (
            <g key={idx}>
              {/* Incident + Internal segments */}
              {showIncident && (
                <polyline
                  points={ray.points.slice(0, 3).map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              
              {/* Refracted segment */}
              {showRefracted && ray.points.length >= 4 && (
                <polyline
                  points={ray.points.slice(2, 4).map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={ray.isTIR ? "#ef4444" : "#f97316"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Arrows */}
              {ray.points.slice(0, -1).map((p, i) => {
                const isRefractedSegment = i === 2;
                if (isRefractedSegment && !showRefracted) return null;
                if (!isRefractedSegment && !showIncident) return null;

                const nextP = ray.points[i+1];
                const angle = Math.atan2(nextP.y - p.y, nextP.x - p.x) * 180 / Math.PI;
                const midX = (p.x + nextP.x) / 2;
                const midY = (p.y + nextP.y) / 2;
                return (
                  <path
                    key={i}
                    d="M -6 -4 L 2 0 L -6 4 Z"
                    fill={ray.isTIR && isRefractedSegment ? "#ef4444" : "#f97316"}
                    transform={`translate(${midX}, ${midY}) rotate(${angle})`}
                  />
                );
              })}
            </g>
          )
        ))}

        {showRefracted && [rayTop, rayBottom].map((ray, idx) => (
          ray && ray.points.length >= 3 && (
            <g key={`normal-${idx}`} opacity="0.3">
              {(() => {
                const p3 = ray.points[2];
                const angle = Math.atan2(p3.y - centerY, p3.x - xCenterCurvature);
                return (
                  <line
                    x1={xCenterCurvature}
                    y1={centerY}
                    x2={p3.x + Math.cos(angle) * 50}
                    y2={p3.y + Math.sin(angle) * 50}
                    stroke="#64748b"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                  />
                );
              })()}
            </g>
          )
        ))}
      </svg>
      
      {showRefracted && rayTop && !rayTop.isTIR && (
        <div className="p-4 border-t border-slate-100 bg-white">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isConvex ? 'Foco Real' : 'Foco Virtual'}
          </p>
          <p className="text-lg font-mono font-bold text-blue-600">
            f ≈ {(rayTop.focalPoint - centerX).toFixed(1)} cm
          </p>
        </div>
      )}
    </div>
  );
}

export default function OpticalBehavior() {
  const [nMedium, setNMedium] = useState(1.0);
  const [nLens, setNLens] = useState(1.5);
  const [radius, setRadius] = useState(400);
  const [rayOffset, setRayOffset] = useState(50);
  const [showIncident, setShowIncident] = useState(true);
  const [showRefracted, setShowRefracted] = useState(true);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <aside className="lg:col-span-1 space-y-6">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-4">
            <Settings2 size={20} className="text-blue-600" />
            <h2>Parâmetros</h2>
          </div>

          {/* Refractive Indices */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">Índice do Meio (n₁)</label>
                <span className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{nMedium.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.01"
                value={nMedium}
                onChange={(e) => setNMedium(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">Índice da Lente (n₂)</label>
                <span className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{nLens.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.01"
                value={nLens}
                onChange={(e) => setNLens(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* Radius Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">Raio de Curvatura (R)</label>
              <span className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{radius} cm</span>
            </div>
            <input
              type="range"
              min="250"
              max="800"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Ray Offset Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">Afastamento dos Raios</label>
              <span className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{rayOffset} cm</span>
            </div>
            <input
              type="range"
              min="10"
              max="180"
              value={rayOffset}
              onChange={(e) => setRayOffset(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Visibility Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wide block mb-2">Visibilidade dos Raios</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowIncident(!showIncident)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  showIncident 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {showIncident ? <Eye size={14} /> : <EyeOff size={14} />}
                Entrada
              </button>
              <button
                onClick={() => setShowRefracted(!showRefracted)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  showRefracted 
                    ? 'bg-orange-50 border-orange-200 text-orange-700' 
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {showRefracted ? <Eye size={14} /> : <EyeOff size={14} />}
                Saída
              </button>
            </div>
          </div>

          <button 
            onClick={() => {
              setNMedium(1.0);
              setNLens(1.5);
              setRadius(400);
              setRayOffset(50);
              setShowIncident(true);
              setShowRefracted(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RefreshCw size={16} />
            Resetar
          </button>
        </section>
      </aside>

      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="flex flex-col xl:flex-row gap-6">
          <LensSimulation 
            nMedium={nMedium} 
            nLens={nLens} 
            radius={radius} 
            rayOffset={rayOffset} 
            isConvex={true} 
            title="Lente Plano-Convexa (Convergente)"
            showIncident={showIncident}
            showRefracted={showRefracted}
          />
          <LensSimulation 
            nMedium={nMedium} 
            nLens={nLens} 
            radius={radius} 
            rayOffset={rayOffset} 
            isConvex={false} 
            title="Lente Plano-Côncava (Divergente)"
            showIncident={showIncident}
            showRefracted={showRefracted}
          />
        </div>

      </div>
    </div>
  );
}
