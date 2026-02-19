import React, { useState } from 'react';
import UploadForm from '../components/UploadForm';
import GraphView from '../components/GraphView';
import FraudRingTable from '../components/FraudRingTable';
import SuspiciousTable from '../components/SuspiciousTable';
import DownloadButton from '../components/DownloadButton';

const Home = () => {
    const [results, setResults] = useState(null);

    return (
        <div className="app-container">
            {!results ? (
                <main className="animate-fade">
                    <section className="hero">
                        <div className="hero__grid">
                            {/* Left Side: Editorial Content */}
                            <div className="hero__text-area">
                                <div className="badge-group" style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                                    <span className="badge badge--ai">AI Analytic Engine</span>
                                    <span className="badge badge--secure">Forensic Secure</span>
                                </div>
                                <h1 className="hero__headline">
                                    Expose Hidden Financial Networks
                                </h1>
                                <p className="hero__subheadline">
                                    Map complex fund flows and identify money muling structures with institutional-grade graph intelligence. Professional forensic analysis for high-volume transaction data.
                                </p>

                                <div className="feature-list" style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div className="feature-item" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div className="feature-icon" style={{ width: '48px', height: '48px', background: 'rgba(13, 148, 136, 0.08)', color: 'var(--accent-teal)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>Topology Cluster Discovery</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Identify circular and layered fund patterns</div>
                                        </div>
                                    </div>
                                    <div className="feature-item" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div className="feature-icon" style={{ width: '48px', height: '48px', background: 'rgba(37, 99, 235, 0.08)', color: 'var(--accent-blue)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>Neural Risk Scoring</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Weighted behavioral anomaly detection</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Upload Card */}
                            <div className="hero__upload-area">
                                <UploadForm onUploadSuccess={setResults} />
                                <div className="upload-footer" style={{ marginTop: '2rem', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-ghost)', fontSize: '0.8rem', fontWeight: 600 }}> Institutional Grade Encryption (AES-256) </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            ) : (
                <div className="analysis-view animate-fade">
                    <header className="analysis-header" style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="badge badge--secure">Investigation #R-291</div>
                            <span style={{ color: 'var(--text-ghost)', fontSize: '0.85rem', fontWeight: 600 }}>AI ANALYSIS COMPLETE</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em' }}>
                                Forensic Intelligence Panel
                            </h2>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <DownloadButton data={results} />
                                <button className="btn btn--primary" onClick={() => setResults(null)} style={{ width: 'auto', padding: '0.8rem 1.75rem' }}>
                                    New Investigation
                                </button>
                            </div>
                        </div>
                    </header>

                    <div className="analysis-grid">
                        {/* Left Side: Graph Visualization */}
                        <div className="analysis-grid__visual">
                            <div className="card card--full" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div className="card__header" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Network Cluster Topology</h3>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Nodal distribution and transactional entropy</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                        <div className="legend-item"><span style={{ background: 'var(--risk)' }}></span> High Risk</div>
                                        <div className="legend-item"><span style={{ background: 'var(--accent-teal)' }}></span> Neutral</div>
                                        <span className="badge badge--ai">Live Interactive Map</span>
                                    </div>
                                </div>
                                <div className="graph-workspace" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                                    <GraphView data={results} layoutType="circular" />
                                    {/* Intelligence Overlay */}
                                    <div className="graph-overlay" style={{ position: 'absolute', bottom: '2rem', right: '2rem', zIndex: 10 }}>
                                        <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderRadius: '12px', border: '1.5px solid rgba(15, 23, 42, 0.05)', boxShadow: 'var(--shadow-warm)' }}>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-ghost)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>View Metrics</div>
                                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                                <div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 800 }}>{results.summary.total_accounts_analyzed}</div>
                                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Nodes</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 800 }}>{results.summary.fraud_rings_detected}</div>
                                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Clusters</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Data Intelligence Panel */}
                        <div className="analysis-grid__data">
                            <div className="intelligence-stack">
                                {/* Top Metrics */}
                                <div className="metrics-grid">
                                    <div className="metric-box">
                                        <div className="metric-box__label">Risk Index</div>
                                        <div className="metric-box__value" style={{ color: 'var(--risk)' }}>Crit-8</div>
                                        <div className="metric-box__track"><div style={{ width: '82%', background: 'var(--risk)' }}></div></div>
                                    </div>
                                    <div className="metric-box">
                                        <div className="metric-box__label">Anomalies</div>
                                        <div className="metric-box__value" style={{ color: 'var(--accent-teal)' }}>{results.summary.suspicious_accounts_flagged}</div>
                                        <div className="metric-box__track"><div style={{ width: '65%', background: 'var(--accent-teal)' }}></div></div>
                                    </div>
                                    <div className="metric-box">
                                        <div className="metric-box__label">Intensity</div>
                                        <div className="metric-box__value" style={{ color: 'var(--accent-blue)' }}>High</div>
                                        <div className="metric-box__track"><div style={{ width: '100%', background: 'var(--accent-blue)' }}></div></div>
                                    </div>
                                </div>

                                {/* Suspicious Table Sections */}
                                <div className="panel-section">
                                    <div className="section-header">
                                        <h4 className="section-header__title">Priority Flagged Entities</h4>
                                        <span className="badge badge--ai">99.2% Conf.</span>
                                    </div>
                                    <SuspiciousTable accounts={results.suspicious_accounts} />
                                </div>

                                <div className="panel-section">
                                    <div className="section-header">
                                        <h4 className="section-header__title">Network Cluster Breakdown</h4>
                                    </div>
                                    <FraudRingTable rings={results.fraud_rings} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .analysis-grid {
                    display: grid;
                    grid-template-columns: 1fr 480px;
                    gap: 3rem;
                    height: calc(100vh - 240px);
                    min-height: 750px;
                }
                .analysis-grid__visual { height: 100%; }
                .analysis-grid__data { overflow-y: auto; padding-right: 0.5rem; }
                .analysis-grid__data::-webkit-scrollbar { width: 4px; }
                .analysis-grid__data::-webkit-scrollbar-thumb { background: var(--border-subtle); border-radius: 99px; }

                .intelligence-stack { display: flex; flex-direction: column; gap: 2.5rem; }
                .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
                .metric-box { background: white; padding: 1.5rem 1.25rem; border: 1.5px solid var(--border-subtle); border-radius: var(--radius-md); transition: var(--transition); }
                .metric-box:hover { border-color: var(--accent-teal); transform: translateY(-2px); }
                .metric-box__label { font-size: 0.65rem; color: var(--text-ghost); font-weight: 800; text-transform: uppercase; margin-bottom: 0.75rem; }
                .metric-box__value { font-size: 1.6rem; font-weight: 800; color: var(--primary); font-family: var(--font-mono); }
                .metric-box__track { height: 3px; background: var(--border-subtle); border-radius: 99px; margin-top: 1rem; overflow: hidden; }
                .metric-box__track > div { height: 100%; transition: width 1s var(--ease); }

                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .section-header__title { font-size: 0.85rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
                
                .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; font-weight: 700; color: var(--text-muted); }
                .legend-item span { width: 8px; height: 8px; border-radius: 50%; }

                @media (max-width: 1400px) {
                    .analysis-grid { grid-template-columns: 1fr 400px; gap: 2rem; }
                }

                @media (max-width: 1100px) {
                    .analysis-grid { grid-template-columns: 1fr; height: auto; }
                }
            `}</style>
        </div>
    );
};

export default Home;
