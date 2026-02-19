import { generateRingId } from '../utils/ringIdGenerator.js';

/**
 * Detects Shell Networks using connected components on a filtered subgraph.
 *
 * Approach:
 *   1. Filter accounts to only those with low activity (≤ 3 tx), short lifespan
 *      (≤ 30 days), and low volume (≤ 10 tx). These are candidate shell accounts.
 *   2. Build an undirected graph among these candidates using the original
 *      directed adjacency list (if A→B exists and both are candidates, connect them).
 *   3. Find connected components via BFS.
 *   4. Keep components with ≥ 3 members — these are the shell networks.
 *   5. Discard any component whose sorted member set is identical to a cycle ring.
 *
 * This guarantees maximal sets (no sub-chains) and O(V+E) performance.
 */
export const detectShellNetworks = (adjacencyList, accountStats, cycleResults) => {
    const detectedRings = [];
    const uniqueRingKeys = new Set();
    const accountsInShellNetworks = new Set();

    const LOW_ACTIVITY_THRESHOLD = 3;
    const HIGH_VOLUME_THRESHOLD = 10;
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    // 1. Build set of cycle ring keys so we can skip duplicates
    const cycleRingKeys = new Set();
    if (cycleResults && cycleResults.detectedRings) {
        for (const ring of cycleResults.detectedRings) {
            const key = [...ring.member_accounts].sort().join('|');
            cycleRingKeys.add(key);
        }
    }

    // 2. Identify candidate shell accounts (low-activity, short-lived, low-volume)
    const candidates = new Set();
    for (const [accId, stats] of Object.entries(accountStats)) {
        if (stats.totalTransactions > HIGH_VOLUME_THRESHOLD) continue;

        const lifeSpanMs = new Date(stats.lastTransaction) - new Date(stats.firstTransaction);
        if (lifeSpanMs > THIRTY_DAYS_MS) continue;

        if (stats.totalTransactions <= LOW_ACTIVITY_THRESHOLD) {
            candidates.add(accId);
        }
    }

    // 3. Build undirected adjacency among candidates
    const undirected = new Map();
    for (const node of candidates) {
        undirected.set(node, new Set());
    }

    for (const [source, neighbors] of Object.entries(adjacencyList)) {
        for (const target of neighbors) {
            // Both endpoints must be candidates OR source/target connects to a candidate
            // We want edges where at least one side is a candidate and both appear in the graph
            if (candidates.has(source) && candidates.has(target)) {
                undirected.get(source).add(target);
                undirected.get(target).add(source);
            }
        }
    }

    // 4. BFS to find connected components
    const visited = new Set();

    for (const node of candidates) {
        if (visited.has(node)) continue;

        const component = [];
        const queue = [node];
        visited.add(node);

        while (queue.length > 0) {
            const current = queue.shift();
            component.push(current);

            for (const neighbor of undirected.get(current)) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }

        // 5. Keep only components with >= 3 members
        if (component.length < 3) continue;

        const sortedMembers = component.sort();
        const ringKey = sortedMembers.join('|');

        // Skip if identical to a cycle ring
        if (cycleRingKeys.has(ringKey)) continue;

        // Skip duplicates (shouldn't happen with BFS, but defensive)
        if (uniqueRingKeys.has(ringKey)) continue;
        uniqueRingKeys.add(ringKey);

        detectedRings.push({
            ring_id: generateRingId(),
            member_accounts: sortedMembers,
            pattern_type: 'shell_network'
        });

        sortedMembers.forEach(acc => accountsInShellNetworks.add(acc));
    }

    return {
        detectedRings,
        accountsInShellNetworks: Array.from(accountsInShellNetworks)
    };
};
