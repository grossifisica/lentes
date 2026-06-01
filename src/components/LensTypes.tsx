import React, { useState, useMemo } from 'react';
import { Settings2, RefreshCw, Sparkles, BookOpen, Layers, Eye, EyeOff } from 'lucide-react';

type FaceType = 'convex' | 'flat' | 'concave';

export default function LensTypes() {
  const [type1, setType1] = useState<FaceType>('convex');
  const [type2, setType2] = useState<FaceType>('convex');
  const [r1, setR1] = useState<number>(150);
  const [r2, setR2] = useState<number>(150);
  const [nMedium, setNMedium] = useState<number>(1.0);
  const [nLens, setNLens] = useState<number>(1.5);
  const [showRays, setShowRays] = useState<boolean>(true);

  const width = 600;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  const h = 100; // Half-height of the lens

  // Calculate dynamic spacing to prevent overlapping
  const tMin = 16;
  const dx1Edge = useMemo(() => {
    if (type1 === 'flat') return 0;
    if (type1 === 'convex') return r1 - Math.sqrt(r1 * r1 - h * h);
    return -(r1 - Math.sqrt(r1 * r1 - h * h));
  }, [type1, r1]);

  const dx2Edge = useMemo(() => {
    if (type2 === 'flat') return 0;
    if (type2 === 'convex') return -(r2 - Math.sqrt(r2 * r2 - h * h));
    return r2 - Math.sqrt(r2 * r2 - h * h);
  }, [type2, r2]);

  // Base thickness of center
  const d = useMemo(() => {
    // Minimum thickness constraint: center thickness + dx2Edge - dx1Edge >= tMin
    // And center thickness >= tMin (especially for concave-concave etc.)
    const reqFromEdge = tMin - (dx2Edge - dx1Edge);
    return Math.max(tMin, reqFromEdge);
  }, [dx1Edge, dx2Edge]);

  const xBase1 = centerX - d / 2;
  const xBase2 = centerX + d / 2;

  // Generate SVG Path for Lens
  const lensPath = useMemo(() => {
    const points: string[] = [];
    const steps = 30;

    // Left Face (Top to Bottom)
    for (let i = 0; i <= steps; i++) {
      const pct = i / steps;
      const currY = centerY - h + pct * (2 * h);
      const diffY = currY - centerY;

      let currX = xBase1;
      if (type1 === 'convex') {
        const xC = xBase1 + r1;
        currX = xC - Math.sqrt(r1 * r1 - diffY * diffY);
      } else if (type1 === 'concave') {
        const xC = xBase1 - r1;
        currX = xC + Math.sqrt(r1 * r1 - diffY * diffY);
      }
      points.push(`${currX},${currY}`);
    }

    // Right Face (Bottom to Top)
    for (let i = steps; i >= 0; i--) {
      const pct = i / steps;
      const currY = centerY - h + pct * (2 * h);
      const diffY = currY - centerY;

      let currX = xBase2;
      if (type2 === 'convex') {
        const xC = xBase2 - r2;
        currX = xC + Math.sqrt(r2 * r2 - diffY * diffY);
      } else if (type2 === 'concave') {
        const xC = xBase2 + r2;
        currX = xC - Math.sqrt(r2 * r2 - diffY * diffY);
      }
      points.push(`${currX},${currY}`);
    }

    return `M ${points[0]} ` + points.slice(1).map(p => `L ${p}`).join(' ') + ' Z';
  }, [type1, type2, r1, r2, d, xBase1, xBase2, centerY]);

  // Ray Tracing Engine
  const rays = useMemo(() => {
    const rayList = [];
    const numRays = 7;
    const startY = centerY - 80;
    const spacing = 160 / (numRays - 1);

    for (let i = 0; i < numRays; i++) {
      const yRay = startY + i * spacing;
      const dy = yRay - centerY;

      if (Math.abs(dy) >= h) continue;

      // 1. First face intersection
      let x1 = xBase1;
      if (type1 === 'convex') {
        const xC = xBase1 + r1;
        x1 = xC - Math.sqrt(r1 * r1 - dy * dy);
      } else if (type1 === 'concave') {
        const xC = xBase1 - r1;
        x1 = xC + Math.sqrt(r1 * r1 - dy * dy);
      }

      const p1 = { x: 0, y: yRay };
      const p2 = { x: x1, y: yRay };

      // 2. Refraction at Face 1
      let alpha1 = 0; // angle of normal pointing into lens
      if (type1 === 'convex') {
        const xC = xBase1 + r1;
        alpha1 = Math.atan2(centerY - yRay, xC - x1);
      } else if (type1 === 'concave') {
        const xC = xBase1 - r1;
        alpha1 = Math.atan2(yRay - centerY, x1 - xC);
      }

      const thetaI1 = -alpha1; 
      const sinThetaR1 = (nMedium / nLens) * Math.sin(thetaI1);
      
      let isTIR1 = Math.abs(sinThetaR1) > 1;
      let phi2 = 0;

      if (!isTIR1) {
        const thetaR1 = Math.asin(sinThetaR1);
        phi2 = alpha1 + thetaR1;
      }

      if (isTIR1) {
        rayList.push({ points: [p1, p2], isTIR: true });
        continue;
      }

      // 3. Second face intersection
      // Ray inside lens: P(t) = P2 + t * (cos(phi2), sin(phi2))
      // Left side is at x1, yRay.
      let x2 = xBase2;
      let y2 = yRay;
      let tIntersect = 0;

      if (type2 === 'flat') {
        x2 = xBase2;
        tIntersect = (xBase2 - x1) / Math.cos(phi2);
        y2 = yRay + tIntersect * Math.sin(phi2);
      } else {
        const xC = type2 === 'convex' ? xBase2 - r2 : xBase2 + r2;
        const dx = x1 - xC;
        const dyRef = yRay - centerY;
        // t^2 + 2Bt + C = 0
        const B = dx * Math.cos(phi2) + dyRef * Math.sin(phi2);
        const C = dx * dx + dyRef * dyRef - r2 * r2;
        const disc = B * B - C;

        if (disc >= 0) {
          const t1 = -B + Math.sqrt(disc);
          const t2 = -B - Math.sqrt(disc);
          
          // Select correct t. We want the intersection on the right face.
          // Since the ray goes left-to-right, t must be > 0.
          const pts = [t1, t2].map(t => ({
            t,
            x: x1 + t * Math.cos(phi2),
            y: yRay + t * Math.sin(phi2)
          })).filter(pt => pt.t > 0);

          // Find the pt whose x is correctly on the face 2 side of circle
          let bestPt = null;
          for (const pt of pts) {
            if (type2 === 'convex' && pt.x >= xC) {
              bestPt = pt;
              break;
            } else if (type2 === 'concave' && pt.x <= xC) {
              bestPt = pt;
              break;
            }
          }
          if (!bestPt && pts.length > 0) {
            // fallback to smallest positive t
            bestPt = pts.reduce((prev, curr) => prev.t < curr.t ? prev : curr);
          }

          if (bestPt) {
            x2 = bestPt.x;
            y2 = bestPt.y;
            tIntersect = bestPt.t;
          }
        }
      }

      const p3 = { x: x2, y: y2 };

      // Check if ray went out of top or bottom bounds before hitting Face 2
      if (Math.abs(y2 - centerY) > h) {
        // Cut ray inside lens
        const tEdge = (Math.sign(y2 - centerY) * h + centerY - yRay) / Math.sin(phi2);
        const pEdge = {
          x: x1 + tEdge * Math.cos(phi2),
          y: centerY + Math.sign(y2 - centerY) * h
        };
        rayList.push({ points: [p1, p2, pEdge], isTIR: false });
        continue;
      }

      // 4. Refraction at Face 2
      let alpha2 = 0; // angle of normally pointing out
      if (type2 === 'flat') {
        alpha2 = 0;
      } else if (type2 === 'convex') {
        const xC = xBase2 - r2;
        alpha2 = Math.atan2(y2 - centerY, x2 - xC);
      } else if (type2 === 'concave') {
        const xC = xBase2 + r2;
        alpha2 = Math.atan2(centerY - y2, xC - x2);
      }

      const thetaI2 = phi2 - alpha2;
      const sinThetaR2 = (nLens / nMedium) * Math.sin(thetaI2);

      let isTIR2 = Math.abs(sinThetaR2) > 1;
      let phi3 = 0;

      if (!isTIR2) {
        const thetaR2 = Math.asin(sinThetaR2);
        phi3 = alpha2 + thetaR2;
      }

      if (isTIR2) {
        rayList.push({ points: [p1, p2, p3], isTIR: true });
        continue;
      }

      // Draw refracted ray to boundaries
      const p4 = {
        x: width,
        y: y2 + (width - x2) * Math.tan(phi3)
      };

      rayList.push({ points: [p1, p2, p3, p4], isTIR: false });
    }

    return rayList;
  }, [type1, type2, r1, r2, nMedium, nLens, d, xBase1, xBase2, centerY]);

  // Determine Lens Nomenclature & Information
  const lensInfo = useMemo(() => {
    if (type1 === 'flat' && type2 === 'flat') {
      return {
        name: 'Lâmina de Faces Paralelas',
        edges: 'Paralelas',
        behavior: 'Neutro (Sem desvio líquido)',
        desc: 'Ambas as faces são perfeitamente planas. Os raios de luz emergem paralelos aos de entrada.',
        converging: null
      };
    }

    if (type1 === 'convex' && type2 === 'convex') {
      const isConv = nLens > nMedium;
      return {
        name: 'Lente Biconvexa',
        edges: 'Finas',
        behavior: isConv ? 'Convergente' : 'Divergente',
        desc: `Duas faces convexas. Sendo as bordas mais finas, a lente é ${isConv ? 'convergente' : 'divergente'} no meio atual.`,
        converging: isConv
      };
    }

    if (type1 === 'concave' && type2 === 'concave') {
      const isConv = nMedium > nLens;
      return {
        name: 'Lente Bicôncava',
        edges: 'Grossas',
        behavior: isConv ? 'Convergente' : 'Divergente',
        desc: `Duas faces côncavas. Sendo as bordas mais grossas, a lente é ${isConv ? 'convergente' : 'divergente'} no meio atual.`,
        converging: isConv
      };
    }

    if ((type1 === 'flat' && type2 === 'convex') || (type1 === 'convex' && type2 === 'flat')) {
      const isConv = nLens > nMedium;
      return {
        name: 'Lente Plano-convexa',
        edges: 'Finas',
        behavior: isConv ? 'Convergente' : 'Divergente',
        desc: `Uma face plana e uma convexa. Bordas finas resultam em comportamento ${isConv ? 'convergente' : 'divergente'}.`,
        converging: isConv
      };
    }

    if ((type1 === 'flat' && type2 === 'concave') || (type1 === 'concave' && type2 === 'flat')) {
      const isConv = nMedium > nLens;
      return {
        name: 'Lente Plano-côncava',
        edges: 'Grossas',
        behavior: isConv ? 'Convergente' : 'Divergente',
        desc: `Uma face plana e uma côncava. Bordas grossas resultam em comportamento ${isConv ? 'convergente' : 'divergente'}.`,
        converging: isConv
      };
    }

    // Meniscus case (one convex, one concave)
    const rConv = type1 === 'convex' ? r1 : r2;
    const rConc = type1 === 'concave' ? r1 : r2;

    if (rConv < rConc) {
      // convex is tighter, so borders are thin
      const isConv = nLens > nMedium;
      return {
        name: 'Lente Côncavo-convexa',
        edges: 'Finas',
        behavior: isConv ? 'Convergente' : 'Divergente',
        desc: 'A face convexa possui maior curvatura (menor raio) do que a face côncava. As bordas são finas.',
        converging: isConv
      };
    } else if (rConc < rConv) {
      // concave is tighter, so borders are thick
      const isConv = nMedium > nLens;
      return {
        name: 'Lente Convexo-côncava',
        edges: 'Grossas',
        behavior: isConv ? 'Convergente' : 'Divergente',
        desc: 'A face côncava possui maior curvatura (menor raio) do que a face convexa. As bordas são grossas.',
        converging: isConv
      };
    } else {
      return {
        name: 'Menisco Neutro',
        edges: 'Uniforme (Mesmo raio)',
        behavior: 'Neutro (Lente Ortoscópica)',
        desc: 'Ambas as curvaturas são perfeitamente idênticas, compensando a deflexão de entrada com a de saída.',
        converging: null
      };
    }
  }, [type1, type2, r1, r2, nMedium, nLens]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Control Panel */}
      <aside className="lg:col-span-1 space-y-6">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:sticky lg:top-24 space-y-6">
          <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-4">
            <Settings2 size={20} className="text-blue-600" />
            <h2>Construtor de Lente</h2>
          </div>

          {/* Face 1 Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Face de Entrada (Esquerda)</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              {(['convex', 'flat', 'concave'] as FaceType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setType1(t)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                    type1 === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t === 'convex' ? 'Convexa' : t === 'flat' ? 'Plana' : 'Côncava'}
                </button>
              ))}
            </div>
            {type1 !== 'flat' && (
              <div className="pt-2">
                <div className="flex justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>Raio de Curvatura:</span>
                  <span>{r1}mm</span>
                </div>
                <input
                  type="range"
                  min="110"
                  max="300"
                  value={r1}
                  onChange={(e) => setR1(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            )}
          </div>

          {/* Face 2 Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Face de Saída (Direita)</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              {(['convex', 'flat', 'concave'] as FaceType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setType2(t)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                    type2 === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t === 'convex' ? 'Convexa' : t === 'flat' ? 'Plana' : 'Côncava'}
                </button>
              ))}
            </div>
            {type2 !== 'flat' && (
              <div className="pt-2">
                <div className="flex justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>Raio de Curvatura:</span>
                  <span>{r2}mm</span>
                </div>
                <input
                  type="range"
                  min="110"
                  max="300"
                  value={r2}
                  onChange={(e) => setR2(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            )}
          </div>

          {/* Indices of Refraction */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span>Índice do Meio (n<sub>meio</sub>):</span>
                <span>{nMedium.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.05"
                value={nMedium}
                onChange={(e) => setNMedium(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span>Índice da Lente (n<sub>lente</sub>):</span>
                <span>{nLens.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.05"
                value={nLens}
                onChange={(e) => setNLens(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          <button
            onClick={() => {
              setType1('convex');
              setType2('convex');
              setR1(150);
              setR2(150);
              setNMedium(1.0);
              setNLens(1.5);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RefreshCw size={16} />
            Resetar Configurações
          </button>
        </section>
      </aside>

      {/* Main Sandbox Area */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        {/* Lab Panel */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-blue-500" />
              <span className="text-sm font-bold text-slate-700">Simulador de Refração Dupla</span>
            </div>
            <button
              onClick={() => setShowRays(!showRays)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                showRays
                  ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {showRays ? <Eye size={14} /> : <EyeOff size={14} />}
              {showRays ? 'Ocultar Raios' : 'Mostrar Raios'}
            </button>
          </div>

          <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-slate-950">
              <defs>
                <pattern id="grid-dark" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-dark)" />

              {/* Optical Axis */}
              <line x1="0" y1={centerY} x2={width} y2={centerY} stroke="#64748b" strokeWidth="1" strokeDasharray="4 4" />

              {/* Lens Custom Shape */}
              <path
                d={lensPath}
                fill="rgba(56, 189, 248, 0.15)"
                stroke="#38bdf8"
                strokeWidth="2.5"
                className="transition-all duration-300"
              />

              {/* Render Ray Paths */}
              {showRays && rays.map((ray, idx) => (
                <g key={idx}>
                  <polyline
                    points={ray.points.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={ray.isTIR ? "#ef4444" : "#f59e0b"}
                    strokeWidth="2"
                    strokeOpacity={ray.isTIR ? "0.9" : "0.8"}
                  />
                  {/* Small arrows on the emergent ray to show propagation */}
                  {ray.points.length >= 3 && !ray.isTIR && (
                    <g>
                      {(() => {
                        const pStart = ray.points[ray.points.length - 2];
                        const pEnd = ray.points[ray.points.length - 1];
                        const angle = Math.atan2(pEnd.y - pStart.y, pEnd.x - pStart.x) * 180 / Math.PI;
                        const midX = (pStart.x + pEnd.x) / 2;
                        const midY = (pStart.y + pEnd.y) / 2;
                        // Avoid rendering arrow near infinite edge
                        if (midX < width - 10) {
                          return (
                            <path
                              d="M -5 -3 L 3 0 L -5 3 Z"
                              fill="#f59e0b"
                              transform={`translate(${midX}, ${midY}) rotate(${angle})`}
                            />
                          );
                        }
                      })()}
                    </g>
                  )}
                </g>
              ))}

              {/* Normal / Center Mark tags */}
              <line x1={centerX} y1={20} x2={centerX} y2={height - 20} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* Dynamic Nomenclature and Physical characteristics card */}
        <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
              <Sparkles size={12} />
              Identificação Física
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{lensInfo.name}</h1>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">{lensInfo.desc}</p>
          </div>

          <div className="flex flex-col justify-center bg-slate-50 p-5 rounded-2xl border border-slate-100 gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bordas da Lente</span>
              <span className="text-sm font-extrabold text-slate-800">{lensInfo.edges}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ação Óptica</span>
              <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${
                lensInfo.behavior.includes('Convergente') ? 'bg-green-50 text-green-600 border border-green-100' :
                lensInfo.behavior.includes('Divergente') ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                'bg-slate-100 text-slate-600'
              }`}>
                {lensInfo.behavior}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
