import React, { useState, useRef } from 'react';
import apiClient from '../api/apiClient';

const UploadForm = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) { setFile(selected); setError(null); }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped?.name.endsWith('.csv')) {
            setFile(dropped);
            setError(null);
        } else {
            setError('Forensic engine requires a valid .csv cluster file');
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    setProgress(percent);
                },
            });
            setTimeout(() => onUploadSuccess(response.data), 1000);
        } catch (err) {
            setError(err.response?.data?.error || 'Intelligence engine timeout. Please retry analysis.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card card--premium" style={{ width: '100%', marginTop: '2rem' }}>
            <form onSubmit={handleSubmit} className="card__body">
                <div
                    className={`upload-zone ${isDragging ? 'upload-zone--active' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => !loading && inputRef.current?.click()}
                    style={{ cursor: loading ? 'wait' : 'pointer' }}
                >
                    <input ref={inputRef} type="file" accept=".csv" onChange={handleFileChange} style={{ display: 'none' }} />

                    <div className="upload-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    </div>

                    {!file ? (
                        <>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                                Initialize Data Scan
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                Drag and drop transaction ledger or <span style={{ color: 'var(--accent-teal)', textDecoration: 'underline' }}>browse</span>
                            </div>
                        </>
                    ) : (
                        <div className="file-preview animate-fade">
                            <div className="upload-icon" style={{ background: 'var(--accent-teal)', color: '#fff', width: '40px', height: '40px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>{file.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--accent-teal)', fontWeight: 600 }}>Forensic payload ready for execution</div>
                            </div>
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="progress-bar">
                        <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
                    </div>
                )}

                {error && (
                    <div style={{ color: 'var(--risk)', fontSize: '0.85rem', marginTop: '1.5rem', textAlign: 'center', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        {error}
                    </div>
                )}

                <div style={{ marginTop: '2.5rem' }}>
                    <button type="submit" className="btn btn--primary" disabled={!file || loading}>
                        {loading ? 'Analyzing Neural Pathways...' : 'Execute Intelligence Scan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UploadForm;
