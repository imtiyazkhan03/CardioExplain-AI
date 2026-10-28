import React from 'react';
import { BookOpen } from 'lucide-react';

export const EducationPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#070b14] min-h-screen text-slate-100">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span>Biomedical Signal &amp; Clinical Electrocardiography Reference</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          ECG Waveforms, Intervals &amp; Vector Basics
        </h1>
        <p className="text-slate-400 text-sm mt-2 max-w-3xl leading-relaxed">
          A structured educational reference outlining the electrophysiological genesis, reference ranges, and clinical significance of each measurable component in the electrocardiogram.
        </p>
      </div>

      {/* Grid of Core Components */}
      <div className="space-y-8">
        {/* Section 1: P Wave and PR Interval */}
        <div id="p-wave" className="bg-[#0b1120] rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.5)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">1. P Wave &amp; PR Interval / Segment</h2>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              Atrial Electrophysiology
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
            <div className="space-y-3">
              <h3 className="font-bold text-white text-sm">P Wave Morphology</h3>
              <p>
                The P wave represents the sequential electrical activation (depolarization) of the right atrium followed by the left atrium, originating from the sinoatrial (SA) node located high in the right atrium.
              </p>
              <ul className="space-y-1.5 pl-3 list-disc text-slate-400">
                <li><strong className="text-slate-200">Normal Duration:</strong> &lt; 120 ms (typically 80 &ndash; 110 ms).</li>
                <li><strong className="text-slate-200">Normal Amplitude:</strong> &lt; 0.25 mV (2.5 mm) in limb leads; &lt; 0.15 mV in precordial leads.</li>
                <li><strong className="text-slate-200">Vector Polarity:</strong> Consistently positive in Lead II and aVF; negative in aVR.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-white text-sm">PR Interval &amp; PR Segment</h3>
              <p>
                The <strong className="text-white">PR interval</strong> measures the elapsed time from initial atrial depolarization (P onset) to the onset of ventricular activation (QRS onset). It encompasses the essential physiological conduction delay across the atrioventricular (AV) node.
              </p>
              <ul className="space-y-1.5 pl-3 list-disc text-slate-400">
                <li><strong className="text-slate-200">Reference Interval:</strong> 120 &ndash; 200 ms (3 to 5 small squares).</li>
                <li><strong className="text-slate-200">Prolonged PR (&gt;200 ms):</strong> First-degree AV nodal conduction delay or vagal hypertonia.</li>
                <li><strong className="text-slate-200">Shortened PR (&lt;120 ms):</strong> Pre-excitation (Wolff-Parkinson-White pattern) or junctional rhythm.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: QRS Complex */}
        <div id="qrs-complex" className="bg-[#0b1120] rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.5)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">2. QRS Complex (Ventricular Depolarization)</h2>
            <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
              Intraventricular Conduction
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
            <div className="space-y-3">
              <h3 className="font-bold text-white text-sm">Component Deflections</h3>
              <p>
                Represents rapid synchronous electrical activation of the ventricular myocardium via the bundle of His, right and left bundle branches, and Purkinje arborizations.
              </p>
              <ul className="space-y-1.5 pl-3 list-disc text-slate-400">
                <li><strong className="text-slate-200">Q Wave:</strong> Initial negative deflection reflecting septal depolarization (left-to-right).</li>
                <li><strong className="text-slate-200">R Wave:</strong> First positive deflection, dominated by left ventricular free wall activation.</li>
                <li><strong className="text-slate-200">S Wave:</strong> Subsequent negative deflection representing terminal basal depolarization.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-white text-sm">Clinical Duration Criteria</h3>
              <p>
                Measured from the earliest deflection (Q or R) to the J-point (where the S wave slope meets the ST segment).
              </p>
              <ul className="space-y-1.5 pl-3 list-disc text-slate-400">
                <li><strong className="text-slate-200">Normal Duration:</strong> 70 &ndash; 100 ms (narrow complex).</li>
                <li><strong className="text-slate-200">Incomplete Conduction Delay:</strong> 100 &ndash; 120 ms.</li>
                <li><strong className="text-slate-200">Wide QRS (&ge;120 ms):</strong> Complete Left or Right Bundle Branch Block (LBBB/RBBB), ventricular pacing, or severe hyperkalemia.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3: ST Segment and T Wave */}
        <div id="st-segment" className="bg-[#0b1120] rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.5)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">3. ST Segment &amp; T Wave (Repolarization)</h2>
            <span className="text-xs font-semibold text-rose-400 bg-rose-950/80 border border-rose-500/30 px-2.5 py-1 rounded-lg">
              Myocardial Recovery &amp; Ischemia
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
            <div className="space-y-3">
              <h3 className="font-bold text-white text-sm">ST Segment J-Point Measurement</h3>
              <p>
                The ST segment connects the QRS complex to the T wave and represents phase 2 (plateau) of the cardiac action potential, when all ventricular cells are uniformly depolarized.
              </p>
              <ul className="space-y-1.5 pl-3 list-disc text-slate-400">
                <li><strong className="text-slate-200">Baseline Reference:</strong> Measured at J + 60ms or J + 80ms relative to the preceding PR segment.</li>
                <li><strong className="text-slate-200">ST Elevation:</strong> &ge;0.1 mV (1 mm) in limb leads or &ge;0.15&ndash;0.2 mV in precordial leads suggests transmural injury (STEMI), pericarditis, or early repolarization.</li>
                <li><strong className="text-slate-200">ST Depression:</strong> &ge;0.05 mV horizontal or downsloping indicates subendocardial ischemia or reciprocal changes.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-white text-sm">T Wave Variations</h3>
              <p>
                Reflects ventricular repolarization (phase 3 of action potential). Normal T waves are asymmetric with a slower upstroke and faster downstroke.
              </p>
              <ul className="space-y-1.5 pl-3 list-disc text-slate-400">
                <li><strong className="text-slate-200">Peaked / Hyperacute:</strong> Early acute ischemia or hyperkalemia (&gt;5.5 mEq/L).</li>
                <li><strong className="text-slate-200">Inverted T Waves:</strong> Ischemia, ventricular strain, or persistent juvenile pattern.</li>
                <li><strong className="text-slate-200">Flattened T Waves:</strong> Hypokalemia or non-specific repolarization variants.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 4: QT and QTc Calculations */}
        <div id="qt-interval" className="bg-[#0b1120] rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.5)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">4. QT and Rate-Corrected QTc Intervals</h2>
            <span className="text-xs font-semibold text-purple-400 bg-purple-950/80 border border-purple-500/30 px-2.5 py-1 rounded-lg">
              Arrhythmogenic Vulnerability
            </span>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <p>
              The QT interval measures the total duration of electrical systole (ventricular depolarization plus repolarization). Because the raw QT interval naturally shortens at faster heart rates and lengthens at slower heart rates, mathematical rate correction (QTc) is required for standardized clinical evaluation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="font-bold text-white text-sm block mb-1">Bazett Formula</span>
                <code className="text-emerald-400 font-mono text-xs block mb-2 font-bold">QTc = QT / &radic;(RR_seconds)</code>
                <p className="text-slate-400 text-[11px]">
                  Historically standard formula; tends to overcorrect at elevated heart rates (&gt;85 bpm) and undercorrect at bradycardic rates.
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="font-bold text-white text-sm block mb-1">Fridericia Formula</span>
                <code className="text-cyan-400 font-mono text-xs block mb-2 font-bold">QTc = QT / &sup3;&radic;(RR_seconds)</code>
                <p className="text-slate-400 text-[11px]">
                  Cube-root correction; provides superior stability and lower rate-dependency at both physiological extremes.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-950/60 rounded-xl border border-amber-500/40 text-amber-200 text-xs font-medium">
              <strong className="text-amber-300">Torsades de Pointes Risk Threshold:</strong> QTc exceeding 500 ms represents an electrophysiological danger zone for polymorphic ventricular tachycardia, frequently precipitated by QT-prolonging pharmacotherapies combined with hypokalemia.
            </div>
          </div>
        </div>

        {/* Section 5: Standard 12-Lead System */}
        <div className="bg-[#0b1120] rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.5)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">5. Standard 12-Lead Anatomical Orientation</h2>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              Vector Projections
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
            <div className="space-y-2">
              <h3 className="font-bold text-white text-sm">Frontal Plane (Limb Leads)</h3>
              <p>Constructed via Einthoven's triangle (Leads I, II, III) and Goldberger's augmented unipolar leads (aVR, aVL, aVF):</p>
              <ul className="space-y-1 pl-3 list-disc text-slate-400">
                <li><strong className="text-slate-200">Inferior Leads (II, III, aVF):</strong> View the diaphragmatic surface of the heart (right coronary artery territory).</li>
                <li><strong className="text-slate-200">High Lateral Leads (I, aVL):</strong> View the superior lateral left ventricular wall (circumflex artery territory).</li>
                <li><strong className="text-slate-200">Cavity Lead (aVR):</strong> Looks directly into the ventricular cavity from the right shoulder.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-white text-sm">Horizontal Plane (Precordial Leads)</h3>
              <p>Six chest electrodes placed across anatomical landmarks:</p>
              <ul className="space-y-1 pl-3 list-disc text-slate-400">
                <li><strong className="text-slate-200">Septal Leads (V1, V2):</strong> 4th intercostal space, right/left sternal border; views ventricular septum.</li>
                <li><strong className="text-slate-200">Anterior Leads (V3, V4):</strong> Views the anterior wall of the left ventricle (LAD artery territory).</li>
                <li><strong className="text-slate-200">Lateral Leads (V5, V6):</strong> 5th intercostal space, anterior/mid-axillary lines; views lateral left ventricle.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
