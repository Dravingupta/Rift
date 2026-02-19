// updated ui
import React from 'react';

const SuspiciousTable = ({ accounts }) => {
    if (!accounts || accounts.length === 0) return null;

    return (
        <div className="card card--mini" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
            <div className="table-container" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                    <thead>
                        <tr style={{ textAlign: 'left' }}>
                            <th style={{ padding: '0.25rem 0.5rem', fontSize: '0.6rem', color: 'var(--text-ghost)', textTransform: 'uppercase' }}>ID</th>
                            <th style={{ padding: '0.25rem 0.5rem', fontSize: '0.6rem', color: 'var(--text-ghost)', textTransform: 'uppercase' }}>Risk</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.slice(0, 10).map((acc) => {
                            const isHighRisk = acc.suspicion_score > 60;
                            return (
                                <tr key={acc.account_id} style={{ background: 'white', border: '1px solid var(--border-subtle)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                                        {acc.account_id}
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ flex: 1, height: '3px', background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                                                <div
                                                    style={{
                                                        height: '100%',
                                                        width: `${acc.suspicion_score}%`,
                                                        background: isHighRisk ? 'var(--risk)' : 'var(--accent-teal)',
                                                    }}
                                                />
                                            </div>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: isHighRisk ? 'var(--risk)' : 'var(--primary)' }}>
                                                {acc.suspicion_score}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {accounts.length > 10 && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-ghost)', textAlign: 'center', marginTop: '0.5rem', fontWeight: 600 }}>
                    + {accounts.length - 10} more flags
                </div>
            )}
        </div>
    );
};

export default SuspiciousTable;
