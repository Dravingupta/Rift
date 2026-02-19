/**
 * Detects Shell Networks (Layered chains with low-activity intermediates).
 * Pattern: A -> B -> C -> D, where B and C have totalTransactions <= 3.
 * Path length >= 3.
 * @param {Object} adjacencyList - Graph adjacency list.
 * @param {Object} accountStats - Account statistics.
 * @returns {Object} - Detected shell networks.
 */
export const detectShellNetworks = (adjacencyList, accountStats) => {
    const detectedRings = [];
    const uniqueRingKeys = new Set();
    const accountsInShellNetworks = new Set();
    const nodes = Object.keys(adjacencyList);

    const MAX_DEPTH = 5;
    const MIN_LENGTH = 3;
    const LOW_ACTIVITY_THRESHOLD = 3;

    for (const startNode of nodes) {
        // Stack for DFS: [currentNode, pathArray, visitedSet]
        // Using iterative DFS or recursive. Recursive is cleaner for depth-limited.

        const dfs = (currentNode, path, visited) => {
            if (path.length > MAX_DEPTH) return;

            // Check if current path is a valid shell network
            // Valid if length >= 3
            // AND intermediate nodes (index 1 to length-2) are low activity
            // We check the condition every time we extend, but we only save if length >= 3

            if (path.length >= MIN_LENGTH) {
                // Validation: Check intermediates
                // Intermediates are path[1] ... path[path.length - 2]
                let isValidShell = true;
                for (let i = 1; i < path.length - 1; i++) {
                    const intermediate = path[i];
                    const stats = accountStats[intermediate];
                    if (!stats || stats.totalTransactions > LOW_ACTIVITY_THRESHOLD) {
                        isValidShell = false;
                        break;
                    }
                }

                if (isValidShell) {
                    // Save this path as a ring/chain
                    const sortedMembers = [...path].sort();
                    const ringKey = sortedMembers.join('|');

                    if (!uniqueRingKeys.has(ringKey)) {
                        uniqueRingKeys.add(ringKey);

                        detectedRings.push({
                            ring_id: `RING_${String(detectedRings.length + 1).padStart(3, '0')}`,
                            member_accounts: sortedMembers, // Sorted as requested, though usually chain order matters for visualization
                            ordered_path: [...path], // Keeping ordered path might be useful but requirement says member_accounts sorted
                            pattern_type: 'shell_network'
                        });

                        path.forEach(acc => accountsInShellNetworks.add(acc));
                    }
                    // Continue searching? Yes, A->B->C (valid) -> D (also valid)
                }
            }

            const neighbors = adjacencyList[currentNode] || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    // Optimization: If we are extending a chain, the CURRENT node (becoming intermediate)
                    // must satisfy the low activity rule if it's not the start node.

                    // If we are at A->B. We want to go to C.
                    // B is now an intermediate. Is B low activity?
                    // If path.length >= 2, the last element of path is `currentNode`.
                    // It will become an intermediate if we go to `neighbor`.
                    // Exception: The `startNode` (path[0]) never needs to be low activity.

                    if (path.length >= 2) { // path has [Start, ... , Current]
                        const stats = accountStats[currentNode];
                        // If current node (which will lie between Start and Neighbor) is active,
                        // we cannot pass through it for a shell chain.
                        if (stats && stats.totalTransactions > LOW_ACTIVITY_THRESHOLD) {
                            continue; // Prune branch
                        }
                    }

                    visited.add(neighbor);
                    path.push(neighbor);
                    dfs(neighbor, path, visited);
                    path.pop();
                    visited.delete(neighbor);
                }
            }
        };

        dfs(startNode, [startNode], new Set([startNode]));
    }

    return {
        detectedRings,
        accountsInShellNetworks: Array.from(accountsInShellNetworks)
    };
};
