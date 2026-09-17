import React, { useState, useEffect } from 'react';
import { 
  Play, ShieldAlert, Search, X, AlertOctagon, CheckCircle2, 
  Info, Server, ArrowRight, Microscope, BarChart3, ShieldCheck
} from 'lucide-react';
import { Dataset, MLModel, Threat, DetectionJob } from '../types';
import { apiService } from '../services/api';

interface ThreatDetectionProps {
  datasets: Dataset[];
  models: MLModel[];
  onDetectionSuccess: (job: DetectionJob) => void;
}

export const ThreatDetection: React.FC<ThreatDetectionProps> = ({
  datasets,
  models,
  onDetectionSuccess
}) => {
  const [selectedDatasetId, setSelectedDatasetId] = useState<number>(0);
  const [selectedModelId, setSelectedModelId] = useState<number>(0);
  const [selectedAnomalyModelId, setSelectedAnomalyModelId] = useState<number>(0);
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [resultJob, setResultJob] = useState<DetectionJob | null>(null);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [filteredThreats, setFilteredThreats] = useState<Threat[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Expanded threat explanations state
  const [expandedThreatId, setExpandedThreatId] = useState<number | null>(null);
  const [explainCache, setExplainCache] = useState<Record<number, any>>({});
  const [explainLoadingId, setExplainLoadingId] = useState<number | null>(null);

  // Filters
  const [searchIp, setSearchIp] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [attackFilter, setAttackFilter] = useState('');

  const steps = [
    "Loading network traffic dataset",
    "Preprocessing and cleaning packet logs",
    "Running machine learning model inference",
    "Calculating class prediction confidence scores",
    "Assigning rule-based threat severity rankings",
    "Generating actionable response recommendations"
  ];

  const classifiers = models.filter(m => m.model_type !== 'anomaly');
  const anomalyModels = models.filter(m => m.model_type === 'anomaly');

  useEffect(() => {
    if (datasets.length > 0 && selectedDatasetId === 0) {
      setSelectedDatasetId(datasets[0].id);
    }
    if (classifiers.length > 0 && selectedModelId === 0) {
      setSelectedModelId(classifiers[0].id);
    }
    if (anomalyModels.length > 0 && selectedAnomalyModelId === 0) {
      setSelectedAnomalyModelId(anomalyModels[0].id);
    }
  }, [datasets, models]);

  useEffect(() => {
    let result = threats;

    if (searchIp.trim()) {
      const q = searchIp.toLowerCase();
      result = result.filter(t => {
        const src = (t.record_data.Source_IP || t.record_data.source_ip || '').toLowerCase();
        const dst = (t.record_data.Destination_IP || t.record_data.dest_ip || '').toLowerCase();
        return src.includes(q) || dst.includes(q);
      });
    }

    if (severityFilter) {
      result = result.filter(t => t.severity === severityFilter);
    }

    if (attackFilter) {
      result = result.filter(t => t.attack_type.toLowerCase() === attackFilter.toLowerCase());
    }

    setFilteredThreats(result);
  }, [threats, searchIp, severityFilter, attackFilter]);

  const handleExecuteDetection = async () => {
    if (selectedDatasetId === 0 || selectedModelId === 0) {
      setErrorMsg("Please select both a dataset and model for inference.");
      return;
    }

    setRunning(true);
    setStepIndex(0);
    setErrorMsg(null);
    setResultJob(null);
    setThreats([]);
    setExpandedThreatId(null);

    const stepTimer = setInterval(() => {
      setStepIndex(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepTimer);
          return prev;
        }
      });
    }, 900);

    try {
      const result = await apiService.runDetection(selectedDatasetId, selectedModelId, selectedAnomalyModelId || undefined);
      await new Promise(resolve => setTimeout(resolve, steps.length * 900 + 200));
      clearInterval(stepTimer);
      setStepIndex(steps.length);
      setResultJob(result.job);
      setThreats(result.threats);
      onDetectionSuccess(result.job);
    } catch (err: any) {
      clearInterval(stepTimer);
      console.error(err);
      setErrorMsg(err.message || "Threat detection execution crashed.");
      setStepIndex(-1);
    } finally {
      setRunning(false);
    }
  };

  const getDistinctAttacks = () => {
    const list = threats.map(t => t.attack_type);
    return Array.from(new Set(list));
  };

  const handleToggleExplain = async (threatId: number) => {
    if (expandedThreatId === threatId) {
      setExpandedThreatId(null);
      return;
    }

    setExpandedThreatId(threatId);

    if (!explainCache[threatId]) {
      setExplainLoadingId(threatId);
      try {
        const details = await apiService.explainThreat(threatId);
        setExplainCache(prev => ({ ...prev, [threatId]: details }));
      } catch (err) {
        console.error("Failed to fetch threat explainability details", err);
      } finally {
        setExplainLoadingId(null);
      }
    }
  };

  return (
    <div className="space-y-8">
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-900/30 rounded-lg text-rose-400 text-xs font-mono">
          <AlertOctagon size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* PIPELINE CONTROL ZONE */}
      <div className="dark-panel p-6 space-y-4">
        <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">Execute Threat Analysis Pipeline</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 font-mono">CHOOSE EVALUATION DATASET:</label>
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(parseInt(e.target.value))}
              disabled={running}
              className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            >
              <option value={0}>-- Choose Dataset --</option>
              {datasets.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.row_count?.toLocaleString()} rows)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 font-mono">SUPERVISED CLASSIFIER:</label>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(parseInt(e.target.value))}
              disabled={running}
              className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            >
              <option value={0}>-- Choose Classifier --</option>
              {classifiers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (ACC: {m.accuracy ? Math.round(m.accuracy*100) : 0}%)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 font-mono">UNSUPERVISED ANOMALY MODEL:</label>
            <select
              value={selectedAnomalyModelId}
              onChange={(e) => setSelectedAnomalyModelId(parseInt(e.target.value))}
              disabled={running}
              className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            >
              <option value={0}>-- Auto Isolation Forest --</option>
              {anomalyModels.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (CONTAM: {m.contamination ? Math.round(m.contamination*100) : 5}%)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExecuteDetection}
            disabled={running || selectedDatasetId === 0 || selectedModelId === 0}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Play size={14} />
            <span>Run Threat Detection</span>
          </button>
        </div>
      </div>

      {/* PIPELINE PROGRESS BAR */}
      {stepIndex >= 0 && stepIndex < steps.length && (
        <div className="dark-panel p-6 space-y-4">
          <h3 className="text-xs font-semibold text-cyan-400 font-mono uppercase tracking-wider animate-pulse-subtle">
            Analysis Pipeline Execution in Progress
          </h3>
          <div className="space-y-3 font-mono text-[11px]">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {idx < stepIndex ? (
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                ) : idx === stepIndex ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-800 border-t-cyan-500 animate-spin shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-800 shrink-0" />
                )}
                <span className={idx === stepIndex ? 'text-white font-medium' : idx < stepIndex ? 'text-slate-400' : 'text-slate-600'}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESULTS GRID / 3D GLASS CARDS */}
      {resultJob && (
        <div className="space-y-6">
          
          {/* Header & Filters */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">Threat Vault</h3>
              <p className="text-slate-500 text-xs mt-0.5">Select a node card to review per-vector explanations</p>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto text-xs font-mono">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded px-2 py-1">
                <Search size={12} className="text-slate-500" />
                <input
                  type="text"
                  placeholder="Search IP..."
                  value={searchIp}
                  onChange={(e) => setSearchIp(e.target.value)}
                  className="bg-transparent border-none focus:outline-none w-28 text-[11px]"
                />
              </div>
              
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300"
              >
                <option value="">All Severity</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={attackFilter}
                onChange={(e) => setAttackFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300"
              >
                <option value="">All Attacks</option>
                {getDistinctAttacks().map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredThreats.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500 italic text-sm">
                No records matching active pipeline rules found.
              </div>
            ) : (
              filteredThreats.map((threat) => {
                const isExpanded = expandedThreatId === threat.id;
                const explainData = explainCache[threat.id];
                const explainLoading = explainLoadingId === threat.id;

                let sevClass = 'border-slate-800/80 bg-slate-950/20 text-slate-400';
                if (threat.severity === 'Critical') sevClass = 'border-red-900/30 bg-red-950/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
                if (threat.severity === 'High') sevClass = 'border-orange-900/30 bg-orange-950/20 text-orange-400';
                if (threat.severity === 'Medium') sevClass = 'border-amber-900/30 bg-amber-950/20 text-amber-400';
                if (threat.severity === 'Low') sevClass = 'border-emerald-900/30 bg-emerald-950/20 text-emerald-400';

                return (
                  <div 
                    key={threat.id} 
                    className={`glass-panel p-6 rounded-2xl border transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group hover:scale-[1.02] ${
                      isExpanded ? 'lg:col-span-2 shadow-cyan-900/10 border-cyan-500/40' : 'hover:shadow-cyan-950/30'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-bl-full pointer-events-none" />
                    
                    {/* Header ID & Severity */}
                    <div className="flex justify-between items-center z-10">
                      <span className="font-mono text-[10px] text-slate-500">VECTOR INCIDENT #{threat.record_index}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider leading-none uppercase ${sevClass}`}>
                        {threat.severity}
                      </span>
                    </div>

                    {/* Attack class name */}
                    <div className="z-10">
                      <h4 className="text-xl font-bold text-white tracking-wide group-hover:text-cyan-300 transition-colors mb-1">{threat.attack_type}</h4>
                      <p className="text-slate-400 text-xs">Prediction Probability Score: <span className="font-mono font-bold text-white">{(threat.confidence * 100).toFixed(1)}%</span></p>
                    </div>

                    {/* IPs details */}
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t border-slate-800/80 pt-3 z-10">
                      <div>
                        <p className="text-[10px] text-slate-500">Source IP Address</p>
                        <p className="text-slate-300 font-semibold truncate">{threat.record_data.Source_IP || threat.record_data.source_ip || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">Destination IP Address</p>
                        <p className="text-slate-300 font-semibold truncate">{threat.record_data.Destination_IP || threat.record_data.dest_ip || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Toggle Explainability Button */}
                    <button 
                      onClick={() => handleToggleExplain(threat.id)} 
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-cyan-400 hover:text-cyan-300 bg-cyan-950/20 border border-cyan-500/20 hover:border-cyan-500/40 text-xs font-bold transition-all z-10 mt-2"
                    >
                      <Microscope size={14} />
                      <span>{isExpanded ? 'Minimize Telemetry Analysis' : 'Explain Threat Class'}</span>
                    </button>

                    {/* Expanded Content (Explainability diagnostic block) */}
                    {isExpanded && (
                      <div className="mt-4 border-t border-slate-800/80 pt-4 space-y-5 text-xs animate-fadeUp z-10">
                        {explainLoading ? (
                          <div className="flex justify-center py-8">
                            <div className="w-6 h-6 rounded-full border-2 border-slate-800 border-t-cyan-500 animate-spin" />
                          </div>
                        ) : explainData ? (
                          <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            
                            {/* Left Side: Summary & Decision logic */}
                            <div className="space-y-4">
                              <div>
                                <h5 className="font-bold text-white mb-1 flex items-center gap-1.5">
                                  <Info size={13} className="text-cyan-400" />
                                  Classification Reasoning
                                </h5>
                                <p className="text-slate-300 text-xs leading-relaxed bg-[#0a0f1a] p-3 rounded-lg border border-blue-900/10">
                                  {explainData.explanation?.summary || 'N/A'}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#050a14] border border-slate-800 p-3 rounded-lg">
                                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Anomaly Score</p>
                                  <p className="text-lg font-bold text-white mt-1">{(explainData.anomaly_score * 100).toFixed(1)}%</p>
                                </div>
                                <div className="bg-[#050a14] border border-slate-800 p-3 rounded-lg">
                                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Risk Index</p>
                                  <p className="text-lg font-bold text-rose-400 mt-1">{(explainData.risk_score * 100).toFixed(1)}%</p>
                                </div>
                              </div>

                              {/* Raw Attributes */}
                              <div>
                                <h5 className="font-bold text-white mb-2 uppercase tracking-wide text-[10px] text-slate-400">Raw Packet Attributes</h5>
                                <div className="p-3 bg-slate-950 rounded font-mono text-[9px] max-h-36 overflow-y-auto space-y-1 text-slate-400 scrollbar-thin">
                                  {Object.entries(threat.record_data).slice(0, 12).map(([key, val]) => (
                                    <div key={key} className="flex justify-between border-b border-slate-900/30 py-0.5">
                                      <span className="text-slate-600 uppercase text-[8px]">{key.replace(/_/g, ' ')}:</span>
                                      <span className="text-slate-300 truncate max-w-[150px]">{val === null ? 'NaN' : String(val)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Right Side: Feature contributions & Mitigations */}
                            <div className="space-y-4">
                              {/* Feature contributions */}
                              <div>
                                <h5 className="font-bold text-white mb-2.5 flex items-center gap-1.5">
                                  <BarChart3 size={13} className="text-cyan-400" />
                                  Feature Contribution Analysis
                                </h5>
                                <div className="space-y-2.5 bg-[#0a0f1a] p-3 rounded-lg border border-blue-900/10">
                                  {explainData.feature_contributions?.slice(0, 4).map((feat: any, fIdx: number) => (
                                    <div key={fIdx}>
                                      <div className="flex justify-between text-[10px] mb-1 font-mono">
                                        <span className="text-slate-400">{feat.feature}</span>
                                        <span className="text-cyan-400 font-bold">{feat.contribution.toFixed(1)}%</span>
                                      </div>
                                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500" style={{ width: `${Math.min(100, feat.contribution)}%` }} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Mitigation actions */}
                              <div>
                                <h5 className="font-bold text-white mb-2 flex items-center gap-1.5">
                                  <ShieldCheck size={13} className="text-emerald-400" />
                                  Recommended Security Controls
                                </h5>
                                <div className="space-y-2">
                                  {explainData.recommended_actions?.map((action: string, aIdx: number) => (
                                    <div key={aIdx} className="flex gap-2 p-2 bg-[#050a14] border border-blue-900/20 rounded leading-relaxed text-slate-300">
                                      <span className="text-rose-500 font-mono font-bold">•</span>
                                      <span>{action}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                          </div>
                        ) : (
                          <div className="text-rose-400 text-center py-4">Failed to acquire telemetry explanations.</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
