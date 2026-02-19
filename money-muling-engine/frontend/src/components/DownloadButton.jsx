


import React from 'react';

const DownloadButton = ({ data }) => {
    if (!data) return null;

    const handleDownload = () => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rift_intelligence_report.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={handleDownload}
            className="btn"
            style={{
                width: 'auto',
                border: '1.5px solid var(--border-default)',
                color: 'var(--text-main)',
                background: '#FFFFFF',
                boxShadow: 'var(--shadow-flat)'
            }}
            id="download-report-btn"
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Intelligent Report
        </button>
    );
};

export default DownloadButton;
