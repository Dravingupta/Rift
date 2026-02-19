// updated ui

import React from 'react';

const FraudRingTable = ({ rings }) => {
    if (!rings || rings.length === 0) return null;

    return (
        <div className="card card--mini" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
            <div className="table-container" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                    <tbody>
                        {rings.map((ring) => (
                            <tr key={ring.ring_id} style={{ background: 'white', border: '1px solid var(--border-subtle)' }}>
                                <td style={{ padding: '0.75rem 0.5rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'capitalize' }}>
                                        {ring.pattern_type.replace(/_/g, ' ').toLowerCase()}
                                    </div>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-ghost)', fontWeight: 600 }}>CLUST-{ring.ring_id.substring(0, 4)}</div>
                                </td>
                                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>
                                    <span className="badge" style={{ padding: '0.2rem 0.6rem', fontSize: '0.6rem', background: 'rgba(13, 148, 136, 0.08)', color: 'var(--accent-teal)' }}>
                                        {ring.member_accounts.length} Nodes
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FraudRingTable;
