/**
 * Calculates suspicion scores for all accounts based on detected patterns and behavior.
 * @param {Object} data - Contains accountStats, cycleResults, smurfResults, shellResults, transactionsByAccount.
 * @returns {Object} - Suspicious accounts list.
 */
export const calculateSuspicionScores = ({
    accountStats,
    cycleResults,
    smurfResults,
    shellResults,
    transactionsByAccount
}) => {
    const suspiciousAccounts = [];
    const accounts = Object.keys(accountStats);

    // Scoring Weights
    const SCORES = {
        CYCLE: 40,
        SMURFING: 25,
        SHELL: 30,
        HIGH_VELOCITY: 10,
        SHORT_ACTIVE: 5,
        MITIGATION: -20
    };

    // Helper sets for quick lookup
    const cycleMembers = new Set(cycleResults.accountsInCycles);
    const smurfMembers = new Set(smurfResults.accountsInSmurfing);
    const shellMembers = new Set(shellResults.accountsInShellNetworks);

    // Helper to check high velocity (>= 5 tx in 24h)
    const checkHighVelocity = (txs) => {
        if (!txs || txs.length < 5) return false;

        // Sort logic is already applied in smurfing detector but transactionsByAccount 
        // from graphBuilder might strictly be insertion order. Let's sort to be safe.
        // Note: optimization - if we trust input is roughly sorted or mostly sorted it's fast.
        // But graphBuilder pushes in order of CSV appearance. 
        // We should create a sorted copy to avoid mutating original if it matters, 
        // but here we just need to check windows.

        // sorting inside loop over 10k accounts might be slow if many txs.
        // Assuming CSV was chronologically sorted? Not guaranteed.
        // Let's sort.
        const sortedTxs = [...txs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const WINDOW_MS = 24 * 60 * 60 * 1000;
        let left = 0;

        for (let right = 0; right < sortedTxs.length; right++) {
            while (new Date(sortedTxs[right].timestamp) - new Date(sortedTxs[left].timestamp) > WINDOW_MS) {
                left++;
            }
            // window size = right - left + 1
            if (right - left + 1 >= 5) return true;
        }
        return false;
    };

    for (const accId of accounts) {
        let score = 0;
        const stats = accountStats[accId];
        const patterns = [];
        const relatedRings = [];

        // 1. Pattern Matching
        if (cycleMembers.has(accId)) {
            score += SCORES.CYCLE;
            patterns.push('cycle');
            // Find detected rings for this account
            cycleResults.detectedRings.forEach(ring => {
                if (ring.member_accounts.includes(accId)) relatedRings.push(ring.ring_id);
            });
        }

        if (smurfMembers.has(accId)) {
            score += SCORES.SMURFING;
            patterns.push('smurfing'); // Could distinguish fan_in/fan_out if we looked closer at detectedRings
            smurfResults.detectedRings.forEach(ring => {
                if (ring.member_accounts.includes(accId)) {
                    if (!patterns.includes(ring.pattern_type)) patterns.push(ring.pattern_type);
                    relatedRings.push(ring.ring_id);
                }
            });
        }

        // Clean up duplicate 'smurfing' tag if we added specific ones
        if (patterns.includes('smurfing') && (patterns.includes('smurfing_fan_in') || patterns.includes('smurfing_fan_out'))) {
            const idx = patterns.indexOf('smurfing');
            patterns.splice(idx, 1);
        }

        if (shellMembers.has(accId)) {
            score += SCORES.SHELL;
            patterns.push('shell_network');
            shellResults.detectedRings.forEach(ring => {
                if (ring.member_accounts.includes(accId)) relatedRings.push(ring.ring_id);
            });
        }

        // 2. Behavioral Signals
        const txs = transactionsByAccount[accId] || [];

        // High Velocity
        if (checkHighVelocity(txs)) {
            score += SCORES.HIGH_VELOCITY;
            patterns.push('high_velocity');
        }

        // Short Active Period (< 3 days)
        const firstTx = new Date(stats.firstTransaction);
        const lastTx = new Date(stats.lastTransaction);
        const lifeSpanMs = lastTx - firstTx;
        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

        if (lifeSpanMs < threeDaysMs) {
            score += SCORES.SHORT_ACTIVE;
            patterns.push('short_active_period');
        }

        // 3. Mitigation (False Positive Reduction)
        // Active > 30 days AND total tx > 50
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        if (lifeSpanMs > thirtyDaysMs && stats.totalTransactions > 50) {
            score += SCORES.MITIGATION;
            // We don't add a 'mitigated' pattern tag usually, just reduce score
        }

        // 4. Normalization
        score = Math.max(0, Math.min(100, score));

        if (score > 0) {
            suspiciousAccounts.push({
                account_id: accId,
                suspicion_score: score,
                detected_patterns: [...new Set(patterns)], // Dedupe
                ring_ids: [...new Set(relatedRings)] // Dedupe
            });
        }
    }

    // Sort descending by score
    suspiciousAccounts.sort((a, b) => b.suspicion_score - a.suspicion_score);

    return { suspiciousAccounts };
};
