// updated ui

import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

const GraphView = ({ data, isPreview = false, layoutType = 'cose' }) => {
    const containerRef = useRef(null);
    const cyRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        let elements = [];
        if (isPreview) {
            const nodes = Array.from({ length: 15 }, (_, i) => ({
                data: { id: `n${i}`, label: '' }
            }));
            const edges = [];
            for (let i = 0; i < nodes.length; i++) {
                if (i > 0) edges.push({ data: { source: `n${i - 1}`, target: `n${i}` } });
                if (i > 4) edges.push({ data: { source: `n${i - 4}`, target: `n${i}` } });
            }
            elements = [...nodes, ...edges];
        } else if (data) {
            data.suspicious_accounts?.forEach(acc => {
                elements.push({
                    data: { id: acc.account_id, label: acc.account_id.substring(0, 4), isSuspicious: acc.suspicion_score > 60 },
                    classes: acc.suspicion_score > 60 ? 'suspicious' : ''
                });
            });

            data.fraud_rings?.forEach(ring => {
                ring.member_accounts.forEach((accId, i) => {
                    const targetIdx = (i + 1) % ring.member_accounts.length;
                    elements.push({
                        data: { source: accId, target: ring.member_accounts[targetIdx], type: ring.pattern_type }
                    });
                });
            });
        }

        const cy = cytoscape({
            container: containerRef.current,
            elements,
            style: [
                {
                    selector: 'node',
                    style: {
                        'width': 8,
                        'height': 8,
                        'background-color': '#0F172A',
                        'label': isPreview ? '' : 'data(label)',
                        'font-size': '8px',
                        'font-family': 'JetBrains Mono, monospace',
                        'font-weight': 600,
                        'color': '#94A3B8',
                        'text-valign': 'bottom',
                        'text-margin-y': 6,
                        'transition-property': 'background-color, width, height',
                        'transition-duration': '0.3s'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 1,
                        'line-color': '#E2E8F0',
                        'curve-style': 'unbundled-bezier',
                        'control-point-distances': [20, -20],
                        'control-point-weights': [0.25, 0.75],
                        'opacity': 0.3,
                    }
                },
                {
                    selector: '.suspicious',
                    style: {
                        'background-color': '#EF4444',
                        'width': 12,
                        'height': 12,
                        'border-width': 4,
                        'border-color': '#EF4444',
                        'border-opacity': 0.15
                    }
                }
            ],
            layout: {
                name: isPreview ? 'random' : (layoutType === 'circular' ? 'circle' : 'cose'),
                animate: true,
                padding: 50,
                animationDuration: 1000,
            },
            userZoomingEnabled: !isPreview,
            userPanningEnabled: !isPreview,
            boxSelectionEnabled: false,
            wheelSensitivity: 0.2
        });

        cyRef.current = cy;

        // Money Flow Particle Animation
        const runFlow = () => {
            if (!cyRef.current) return;
            cy.edges().forEach((edge, i) => {
                setTimeout(() => {
                    if (!cyRef.current) return;
                    edge.animate({
                        style: { 'line-color': '#0D9488', 'opacity': 0.8, 'width': 2 }
                    }, {
                        duration: 1200,
                        complete: () => {
                            if (!cyRef.current) return;
                            edge.animate({
                                style: { 'line-color': '#E2E8F0', 'opacity': 0.3, 'width': 1 }
                            }, { duration: 800 });
                        }
                    });
                }, i * 150);
            });
        };

        if (!isPreview) {
            const flowInterval = setInterval(() => {
                if (Math.random() > 0.3) runFlow();
            }, 6000);
            runFlow();
            return () => clearInterval(flowInterval);
        }

        return () => {
            if (cyRef.current) {
                cyRef.current.destroy();
                cyRef.current = null;
            }
        };
    }, [data, isPreview, layoutType]);

    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default GraphView;
