import React, { useState, useMemo } from 'react';
import { Settings2, Info, ZoomIn, Eye, EyeOff, ZoomOut } from 'lucide-react';

type LensType = 'converging' | 'diverging';

export default function ImageFormation() {
  const [focalLength, setFocalLength] = useState(100);
  const [objectDistance, setObjectDistance] = useState(200);
  const [lensType, setLensType] = useState<LensType>('converging');
  const [objectHeight, setObjectHeight] = useState(60);
  const [showRay1, setShowRay1] = useState(true);
  const [showRay2, setShowRay2] = useState(true);
  const [showRay3, setShowRay3] = useState(true);
  const [showRay4, setShowRay4] = useState(true);
  const [showExtensions, setShowExtensions] = useState(true);

  // Effective focal length based on type
  const f = lensType === 'converging' ? focalLength : -focalLength;
  const p = objectDistance;

  // Gauss Equation: 1/f = 1/p + 1/p' => 1/p' = 1/f - 1/p => p' = (f * p) / (p - f)
  const pPrime = useMemo(() => {
    if (p === f) return Infinity; // Object at focus
    return (f * p) / (p - f);
  }, [f, p]);

  // Magnification: A = -p' / p
  const A = useMemo(() => {
    if (p === 0) return 1;
    return -pPrime / p;
  }, [pPrime, p]);

  const imageHeight = objectHeight * A;

  // SVG dimensions and scaling
  const width = 800;
  const height = 500;
  const centerX = width / 2; // Center the lens
  const centerY = height / 2;

  // Lens representation
  const lensHeight = 300;
  
  // Calculate path for lens (Gauss representation: vertical line with arrows)
  const getLensPath = () => {
    const h = lensHeight / 2;
    const arrowSize = 10;
    if (lensType === 'converging') {
      // Converging: arrows pointing outwards
      return `M ${centerX} ${centerY - h} L ${centerX} ${centerY + h} 
              M ${centerX - arrowSize} ${centerY - h + arrowSize} L ${centerX} ${centerY - h} L ${centerX + arrowSize} ${centerY - h + arrowSize}
              M ${centerX - arrowSize} ${centerY + h - arrowSize} L ${centerX} ${centerY + h} L ${centerX + arrowSize} ${centerY + h - arrowSize}`;
    } else {
      // Diverging: arrows pointing inwards
      return `M ${centerX} ${centerY - h} L ${centerX} ${centerY + h}
              M ${centerX - arrowSize} ${centerY - h} L ${centerX} ${centerY - h + arrowSize} M ${centerX + arrowSize} ${centerY - h} L ${centerX} ${centerY - h + arrowSize}
              M ${centerX - arrowSize} ${centerY + h} L ${centerX} ${centerY + h - arrowSize} M ${centerX + arrowSize} ${centerY + h} L ${centerX} ${centerY + h - arrowSize}`;
    }
  };

  const isRealImage = pPrime > 0;
  const isVirtualImage = pPrime < 0;
  const isInfinite = !isFinite(pPrime);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Controls Panel */}
      <aside className="lg:col-span-1 space-y-6">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-4">
            <Settings2 size={20} className="text-blue-600" />
            <h2>Configurações</h2>
          </div>

          {/* Lens Type Toggle */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">Tipo de Lente</label>
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setLensType('converging')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  lensType === 'converging' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Convergente
              </button>
              <button
                onClick={() => setLensType('diverging')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  lensType === 'diverging' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Divergente
              </button>
            </div>
          </div>

          {/* Focal Length Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">Distância Focal (f)</label>
              <span className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{focalLength} cm</span>
            </div>
            <input
              type="range"
              min="20"
              max="250"
              value={focalLength}
              onChange={(e) => setFocalLength(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Object Distance Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">Distância do Objeto (p)</label>
              <span className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{objectDistance} cm</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              value={objectDistance}
              onChange={(e) => setObjectDistance(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Object Height Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">Altura do Objeto (y)</label>
              <span className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{objectHeight} cm</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={objectHeight}
              onChange={(e) => setObjectHeight(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </section>

        {/* Visibility Controls for Light Rays */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
            <Eye size={18} className="text-blue-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Raios Luminosos</h2>
          </div>
          
          <div className="flex flex-col gap-2.5">
            {/* Ray 1 */}
            <div className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded bg-orange-500 shadow-sm shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">Raio 1</span>
                  <span className="text-[10px] text-slate-400 font-medium">Paralelo / Foco</span>
                </div>
              </div>
              <button 
                onClick={() => setShowRay1(!showRay1)}
                className={`p-1.5 rounded-lg transition-colors border ${showRay1 ? 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100' : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'}`}
                title={showRay1 ? "Ocultar Raio 1" : "Mostrar Raio 1"}
              >
                {showRay1 ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>

            {/* Ray 2 */}
            <div className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded bg-purple-500 shadow-sm shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">Raio 2</span>
                  <span className="text-[10px] text-slate-400 font-medium">Centro Óptico</span>
                </div>
              </div>
              <button 
                onClick={() => setShowRay2(!showRay2)}
                className={`p-1.5 rounded-lg transition-colors border ${showRay2 ? 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100' : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'}`}
                title={showRay2 ? "Ocultar Raio 2" : "Mostrar Raio 2"}
              >
                {showRay2 ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>

            {/* Ray 3 */}
            <div className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded bg-sky-600 shadow-sm shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">Raio 3</span>
                  <span className="text-[10px] text-slate-400 font-medium">Foco / Paralelo</span>
                </div>
              </div>
              <button 
                onClick={() => setShowRay3(!showRay3)}
                className={`p-1.5 rounded-lg transition-colors border ${showRay3 ? 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100' : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'}`}
                title={showRay3 ? "Ocultar Raio 3" : "Mostrar Raio 3"}
              >
                {showRay3 ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>

            {/* Ray 4 */}
            <div className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded bg-emerald-600 shadow-sm shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">Raio 4</span>
                  <span className="text-[10px] text-slate-400 font-medium">Antiprincipal</span>
                </div>
              </div>
              <button 
                onClick={() => setShowRay4(!showRay4)}
                className={`p-1.5 rounded-lg transition-colors border ${showRay4 ? 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100' : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'}`}
                title={showRay4 ? "Ocultar Raio 4" : "Mostrar Raio 4"}
              >
                {showRay4 ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>

            {/* Extensions */}
            <div className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors border-t border-slate-100 pt-3 mt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded border border-dashed border-slate-400 bg-slate-50 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 font-bold">Prolongamento</span>
                  <span className="text-[10px] text-slate-400 font-medium font-medium">Pontilhado retro</span>
                </div>
              </div>
              <button 
                onClick={() => setShowExtensions(!showExtensions)}
                className={`p-1.5 rounded-lg transition-colors border ${showExtensions ? 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100' : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'}`}
                title={showExtensions ? "Ocultar Prolongamentos" : "Mostrar Prolongamentos"}
              >
                {showExtensions ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>
          </div>
        </section>
      </aside>

      {/* Simulation Canvas and Calculations */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative group">
          <div className="absolute top-4 left-6 z-10 flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600">
              <ZoomIn size={14} />
              <span>Visualização Interativa</span>
            </div>
          </div>

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto bg-slate-50 cursor-crosshair"
            style={{ maxHeight: '70vh' }}
          >
            {/* Grid Lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Optical Axis */}
            <line
              x1="0"
              y1={centerY}
              x2={width}
              y2={centerY}
              stroke="#000000"
              strokeWidth="1.5"
            />

            {/* Lens (Gauss representation) */}
            <path
              d={getLensPath()}
              fill="none"
              stroke="#334155"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points: Focus (F, F') and Anti-principal (A, A') */}
            <g>
              {/* Object side focus F and A */}
              <circle cx={centerX - f} cy={centerY} r="4" fill="#3b82f6" />
              <text x={centerX - f} y={centerY + 20} textAnchor="middle" className="text-[12px] font-bold fill-blue-600">F</text>
              
              <circle cx={centerX - 2 * f} cy={centerY} r="4" fill="#64748b" />
              <text x={centerX - 2 * f} y={centerY + 20} textAnchor="middle" className="text-[12px] font-bold fill-slate-500">A</text>

              {/* Image side focus F' and A' */}
              <circle cx={centerX + f} cy={centerY} r="4" fill="#3b82f6" />
              <text x={centerX + f} y={centerY + 20} textAnchor="middle" className="text-[12px] font-bold fill-blue-600">F'</text>
              
              <circle cx={centerX + 2 * f} cy={centerY} r="4" fill="#64748b" />
              <text x={centerX + 2 * f} y={centerY + 20} textAnchor="middle" className="text-[12px] font-bold fill-slate-500">A'</text>
              
              <circle cx={centerX} cy={centerY} r="4" fill="#0f172a" />
              <text x={centerX + 10} y={centerY + 20} textAnchor="start" className="text-[12px] font-bold fill-slate-900">O</text>
            </g>

            {/* Object */}
            <g transform={`translate(${centerX - p}, ${centerY - objectHeight})`}>
              <line x1="0" y1="0" x2="0" y2={objectHeight} stroke="#ef4444" strokeWidth="3" />
              <path d="M -5 10 L 0 0 L 5 10" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinejoin="round" />
              <text x="0" y="-10" textAnchor="middle" className="text-[10px] font-bold fill-red-600 uppercase">Objeto</text>
            </g>

            {/* Image */}
            {!isInfinite && (
              <g transform={`translate(${centerX + pPrime}, ${centerY - imageHeight})`}>
                <line x1="0" y1="0" x2="0" y2={imageHeight} stroke="#ef4444" strokeWidth="3" strokeDasharray={isVirtualImage ? "4 2" : "none"} />
                <path 
                  d={imageHeight > 0 ? "M -5 10 L 0 0 L 5 10" : "M -5 -10 L 0 0 L 5 -10"} 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="3" 
                  strokeLinejoin="round" 
                />
                <text x="0" y={imageHeight > 0 ? -10 : 20} textAnchor="middle" className="text-[10px] font-bold fill-red-600 uppercase">Imagem</text>
              </g>
            )}

            {/* Ray 1: Parallel -> Image Focus (F') */}
            {showRay1 && (
              <g opacity="0.8">
                {/* Incident Ray */}
                <line
                  x1={centerX - p}
                  y1={centerY - objectHeight}
                  x2={centerX}
                  y2={centerY - objectHeight}
                  stroke="#f97316"
                  strokeWidth="2"
                />
                {/* Arrow for Incident Ray */}
                <path 
                  d="M -6 -4 L 2 0 L -6 4 Z" 
                  fill="#f97316" 
                  transform={`translate(${(centerX - p + centerX) / 2}, ${centerY - objectHeight})`} 
                />
                {/* Refracted Ray */}
                {(() => {
                  const x1 = centerX;
                  const y1 = centerY - objectHeight;
                  const x2 = centerX + f;
                  const y2 = centerY;
                  const m_ray = (y2 - y1) / (x2 - x1);
                  
                  const xEnd = width;
                  const yEnd = y1 + m_ray * (xEnd - x1);
                  
                  const xExt = 0;
                  const yExt = y1 + m_ray * (xExt - x1);

                  const angleRefracted = Math.atan2(yEnd - y1, xEnd - x1) * 180 / Math.PI;

                  return (
                    <>
                      <line x1={x1} y1={y1} x2={xEnd} y2={yEnd} stroke="#f97316" strokeWidth="2" />
                      <path 
                        d="M -6 -4 L 2 0 L -6 4 Z" 
                        fill="#f97316" 
                        transform={`translate(${x1 + (xEnd - x1) * 0.2}, ${y1 + (yEnd - y1) * 0.2}) rotate(${angleRefracted})`} 
                      />
                      {showExtensions && (
                        <line x1={x1} y1={y1} x2={xExt} y2={yExt} stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 2" />
                      )}
                    </>
                  );
                })()}
              </g>
            )}

            {/* Ray 2: Through Optical Center (O) */}
            {showRay2 && (
              <g opacity="0.8">
                {/* Incident Ray to Center */}
                <line
                  x1={centerX - p}
                  y1={centerY - objectHeight}
                  x2={centerX}
                  y2={centerY}
                  stroke="#a855f7"
                  strokeWidth="2"
                />
                {/* Arrow for Incident Ray 2 */}
                {(() => {
                  const angleIncident = Math.atan2(centerY - (centerY - objectHeight), centerX - (centerX - p)) * 180 / Math.PI;
                  return (
                    <path 
                      d="M -6 -4 L 2 0 L -6 4 Z" 
                      fill="#a855f7" 
                      transform={`translate(${(centerX - p + centerX) / 2}, ${(centerY - objectHeight + centerY) / 2}) rotate(${angleIncident})`} 
                    />
                  );
                })()}
                {/* Refracted Ray (Straight through) */}
                {(() => {
                  const x1 = centerX;
                  const y1 = centerY;
                  const m_ray = objectHeight / p;
                  
                  const xEnd = width;
                  const yEnd = y1 + m_ray * (xEnd - x1);
                  
                  const xExt = 0;
                  const yExt = y1 + m_ray * (xExt - x1);

                  const angleRefracted = Math.atan2(yEnd - y1, xEnd - x1) * 180 / Math.PI;

                  return (
                    <>
                      <line x1={x1} y1={y1} x2={xEnd} y2={yEnd} stroke="#a855f7" strokeWidth="2" />
                      <path 
                        d="M -6 -4 L 2 0 L -6 4 Z" 
                        fill="#a855f7" 
                        transform={`translate(${x1 + (xEnd - x1) * 0.2}, ${y1 + (yEnd - y1) * 0.2}) rotate(${angleRefracted})`} 
                      />
                      {showExtensions && (
                        <line x1={x1} y1={y1} x2={xExt} y2={yExt} stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 2" />
                      )}
                    </>
                  );
                })()}
              </g>
            )}

            {/* Ray 3: Focus -> Parallel */}
            {showRay3 && (
              <g opacity="0.8">
                {(() => {
                  const x1 = centerX - p;
                  const y1 = centerY - objectHeight;
                  
                  const denom3 = p - f;
                  const safeDenom3 = Math.abs(denom3) < 2 ? (denom3 < 0 ? -2 : 2) : denom3;
                  const yLens3 = centerY + (f * objectHeight) / safeDenom3;

                  const angleIncident3 = Math.atan2(yLens3 - y1, centerX - x1) * 180 / Math.PI;
                  const xEnd3 = width;
                  const yEnd3 = yLens3; // Emerges parallel
                  
                  const xExt3 = 0;
                  const yExt3 = yLens3;

                  return (
                    <>
                      {/* Incident Ray */}
                      <line x1={x1} y1={y1} x2={centerX} y2={yLens3} stroke="#0284c7" strokeWidth="2" />
                      <path 
                        d="M -6 -4 L 2 0 L -6 4 Z" 
                        fill="#0284c7" 
                        transform={`translate(${(x1 + centerX) / 2}, ${(y1 + yLens3) / 2}) rotate(${angleIncident3})`} 
                      />
                      {/* Refracted Ray */}
                      <line x1={centerX} y1={yLens3} x2={xEnd3} y2={yEnd3} stroke="#0284c7" strokeWidth="2" />
                      <path 
                        d="M -6 -4 L 2 0 L -6 4 Z" 
                        fill="#0284c7" 
                        transform={`translate(${centerX + (xEnd3 - centerX) * 0.2}, ${yLens3})`} 
                      />
                      {/* Extension */}
                      {showExtensions && (
                        <line x1={centerX} y1={yLens3} x2={xExt3} y2={yExt3} stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 2" />
                      )}
                    </>
                  );
                })()}
              </g>
            )}

            {/* Ray 4: Anti-principal / Center of curvature -> Center of curvature */}
            {showRay4 && (
              <g opacity="0.8">
                {(() => {
                  const x1 = centerX - p;
                  const y1 = centerY - objectHeight;
                  
                  const denom4 = p - 2 * f;
                  const safeDenom4 = Math.abs(denom4) < 2 ? (denom4 < 0 ? -2 : 2) : denom4;
                  const yLens4 = centerY + (2 * f * objectHeight) / safeDenom4;

                  const angleIncident4 = Math.atan2(yLens4 - y1, centerX - x1) * 180 / Math.PI;
                  
                  // Emergent ray points towards image antiprincipal point A' which is at (centerX + 2 * f, centerY)
                  const m_emergent4 = (centerY - yLens4) / (2 * f);
                  const xEnd4 = width;
                  const yEnd4 = yLens4 + m_emergent4 * (xEnd4 - centerX);

                  const xExt4 = 0;
                  const yExt4 = yLens4 + m_emergent4 * (xExt4 - centerX);

                  const angleRefracted4 = Math.atan2(yEnd4 - yLens4, xEnd4 - centerX) * 180 / Math.PI;

                  return (
                    <>
                      {/* Incident Ray */}
                      <line x1={x1} y1={y1} x2={centerX} y2={yLens4} stroke="#059669" strokeWidth="2" />
                      <path 
                        d="M -6 -4 L 2 0 L -6 4 Z" 
                        fill="#059669" 
                        transform={`translate(${(x1 + centerX) / 2}, ${(y1 + yLens4) / 2}) rotate(${angleIncident4})`} 
                      />
                      {/* Refracted Ray */}
                      <line x1={centerX} y1={yLens4} x2={xEnd4} y2={yEnd4} stroke="#059669" strokeWidth="2" />
                      <path 
                        d="M -6 -4 L 2 0 L -6 4 Z" 
                        fill="#059669" 
                        transform={`translate(${centerX + (xEnd4 - centerX) * 0.2}, ${yLens4 + m_emergent4 * (xEnd4 - centerX) * 0.2}) rotate(${angleRefracted4})`} 
                      />
                      {/* Extension */}
                      {showExtensions && (
                        <line x1={centerX} y1={yLens4} x2={xExt4} y2={yExt4} stroke="#059669" strokeWidth="1.5" strokeDasharray="4 2" />
                      )}
                    </>
                  );
                })()}
              </g>
            )}
          </svg>
        </div>

        {/* Image Properties Summary */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Propriedades da Imagem</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className={`w-3 h-3 rounded-full ${isRealImage ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-sm font-bold text-slate-700">{isRealImage ? 'Imagem Real' : isInfinite ? 'Imagem Imprópria' : 'Imagem Virtual'}</span>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className={`w-3 h-3 rounded-full ${A > 0 ? 'bg-blue-500' : 'bg-rose-500'}`} />
              <span className="text-sm font-bold text-slate-700">{A > 0 ? 'Direita' : 'Invertida'}</span>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className={`w-3 h-3 rounded-full ${Math.abs(A) > 1 ? 'bg-purple-500' : 'bg-slate-500'}`} />
              <span className="text-sm font-bold text-slate-700">{Math.abs(A) > 1 ? 'Ampliada' : Math.abs(A) === 1 ? 'Mesmo Tamanho' : 'Reduzida'}</span>
            </div>
          </div>
        </div>

        {/* Results Summary (Calculations) */}
        <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Equação de Gauss</h3>
              
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 font-mono text-sm space-y-4">
                <div className="flex flex-col gap-2">
                  <p className="text-blue-400 font-bold">1. Fórmula Base:</p>
                  <p className="pl-2">1/f = 1/p + 1/p'</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <p className="text-blue-400 font-bold">2. Substituição:</p>
                  <p className="pl-2">1/{focalLength} = 1/{objectDistance} + 1/p'</p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-blue-400 font-bold">3. Isolando 1/p':</p>
                  <p className="pl-2">1/p' = 1/{focalLength} - 1/{objectDistance}</p>
                </div>

                <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
                  <p className="text-blue-400 font-bold">4. Resultado:</p>
                  <p className="pl-2 text-2xl text-emerald-400 font-bold">
                    p' = {isInfinite ? '∞' : `${pPrime.toFixed(2)} cm`}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aumento Linear</h3>
              
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 font-mono text-sm space-y-4">
                <div className="flex flex-col gap-2">
                  <p className="text-emerald-400 font-bold">1. Fórmula Base:</p>
                  <p className="pl-2">A = -p' / p</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <p className="text-emerald-400 font-bold">2. Substituição:</p>
                  <p className="pl-2">A = -({isInfinite ? '∞' : pPrime.toFixed(2)}) / {objectDistance}</p>
                </div>

                <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
                  <p className="text-emerald-400 font-bold">3. Resultado:</p>
                  <p className="pl-2 text-2xl text-blue-400 font-bold">
                    A = {isInfinite ? '∞' : `${A.toFixed(2)}x`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Educational Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="flex items-center gap-2 font-bold text-slate-800">
              <Info size={18} className="text-blue-600" />
              Equação de Gauss
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl font-mono text-center text-lg border border-slate-100">
              <span className="text-blue-600">1/f</span> = <span className="text-slate-900">1/p</span> + <span className="text-emerald-600">1/p'</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              A equação de Gauss relaciona a distância focal (f), a distância do objeto (p) e a distância da imagem (p'). 
              Para lentes <strong>convergentes</strong>, f é positivo. Para <strong>divergentes</strong>, f é negativo.
            </p>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="flex items-center gap-2 font-bold text-slate-800">
              <ZoomOut size={18} className="text-emerald-600" />
              Aumento Linear (A)
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl font-mono text-center text-lg border border-slate-100">
              <span className="text-emerald-600">A</span> = <span className="text-slate-900">-p' / p</span> = <span className="text-blue-600">y' / y</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              O aumento linear indica quantas vezes a imagem é maior que o objeto. Se <strong>A {'>'} 0</strong>, a imagem é direita. 
              Se <strong>A {'<'} 0</strong>, a imagem é invertida em relação ao objeto.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
