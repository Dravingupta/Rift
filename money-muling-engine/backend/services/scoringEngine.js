/**
 * Calculates suspicion scores for all accounts.
 *
 * Scoring philosophy:
 *   - cycle        = STRONG signal (40 pts) — circular money routing
 *   - smurfing     = MEDIUM signal (25 pts) — structuring to avoid thresholds
 *   - shell        = WEAK signal  (10 pts) — only meaningful when combined
 *   - high_velocity = behavioral  (10 pts) — burst of activity
 *   - short_active  = behavioral  ( 5 pts) — account used briefly
 *
 * Threshold: 35.  Shell-only (even + short_active) is NOT enough to flag.
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

    const SCORES = {
        CYCLE: 40,
        SMURFING: 25,
        SHELL: 10,
        HIGH_VELOCITY: 10,
        SHORT_ACTIVE: 5,
        MITIGATION: -20
    };

    const MIN_SUSPICION_THRESHOLD = 35;

    const cycleMembers = new Set(cycleResults.accountsInCycles);
    const smurfMembers = new Set(smurfResults.accountsInSmurfing);
    const shellMembers = new Set(shellResults.accountsInShellNetworks);

    const checkHighVelocity = (txs) => {
        if (!txs || txs.length < 5) return false;
        const sortedTxs = [...txs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const WINDOW_MS = 24 * 60 * 60 * 1000;
        let left = 0;
        for (let right = 0; right < sortedTxs.length; right++) {
            while (new Date(sortedTxs[right].timestamp) - new Date(sortedTxs[left].timestamp) > WINDOW_MS) {
                left++;
            }
            if (right - left + 1 >= 5) return true;
        }
        return false;
    };

    for (const accId of accounts) {
        let score = 0;
        const stats = accountStats[accId];
        const patterns = [];
        const relatedRings = [];

        const firstTx = new Date(stats.firstTransaction);
        const lastTx = new Date(stats.lastTransaction);
        const lifeSpanMs = lastTx - firstTx;
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

        // Track which signal categories are present
        let hasCycle = false;
        let hasSmurfing = false;
        let hasShell = false;

        // 1. Cycle — strong signal
        if (cycleMembers.has(accId)) {
            hasCycle = true;
            score += SCORES.CYCLE;
            patterns.push('cycle');
            cycleResults.detectedRings.forEach(ring => {
                if (ring.member_accounts.includes(accId)) relatedRings.push(ring.ring_id);
            });
        }

        // 2. Smurfing — medium signal
        if (smurfMembers.has(accId)) {
            hasSmurfing = true;
            score += SCORES.SMURFING;
            patterns.push('smurfing');
            smurfResults.detectedRings.forEach(ring => {
                if (ring.member_accounts.includes(accId)) {
                    if (!patterns.includes(ring.pattern_type)) patterns.push(ring.pattern_type);
                    relatedRings.push(ring.ring_id);
                }
            });
        }

        if (patterns.includes('smurfing') && (patterns.includes('smurfing_fan_in') || patterns.includes('smurfing_fan_out'))) {
            const idx = patterns.indexOf('smurfing');
            patterns.splice(idx, 1);
        }

        // 3. Shell — weak signal, with false-positive guard
        if (shellMembers.has(accId)) {
            const uniqueConnections = new Set([
                ...(transactionsByAccount[accId] || []).map(tx => tx.sender_id),
                ...(transactionsByAccount[accId] || []).map(tx => tx.receiver_id)
            ]);
            uniqueConnections.delete(accId);

            const isLegitimate =
                stats.totalTransactions > 10 ||
                lifeSpanMs > thirtyDaysMs ||
                uniqueConnections.size > 20;

            if (!isLegitimate) {
                hasShell = true;
                score += SCORES.SHELL;
                patterns.push('shell_network');
                shellResults.detectedRings.forEach(ring => {
                    if (ring.member_accounts.includes(accId)) relatedRings.push(ring.ring_id);
                });
            }
        }

        // 4. High Velocity — behavioral
        const txs = transactionsByAccount[accId] || [];
        if (checkHighVelocity(txs)) {
            score += SCORES.HIGH_VELOCITY;
            patterns.push('high_velocity');
        }

        // 5. Short Active Period (< 3 days)
        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
        if (lifeSpanMs < threeDaysMs) {
            score += SCORES.SHORT_ACTIVE;
            patterns.push('short_active_period');
        }

        // 6. Mitigation — long-term high-volume accounts
        if (lifeSpanMs > thirtyDaysMs && stats.totalTransactions > 50) {
            score += SCORES.MITIGATION;
        }

        // 7. Normalize to 0-100
        score = Math.max(0, Math.min(100, score));

        // 8. Escalation guard: shell-only accounts must NOT be flagged
        //    Even shell + short_active (10 + 5 = 15) won't reach threshold of 35,
        //    but we add an explicit guard for clarity.
        if (hasShell && !hasCycle && !hasSmurfing) {
            // Shell-only or shell + behavioral — not enough to flag
            continue;
        }

        // 9. Threshold gate
        if (score >= MIN_SUSPICION_THRESHOLD) {
            suspiciousAccounts.push({
                account_id: accId,
                suspicion_score: score,
                detected_patterns: [...new Set(patterns)],
                ring_ids: [...new Set(relatedRings)]
            });
        }
    }

    suspiciousAccounts.sort((a, b) => b.suspicion_score - a.suspicion_score);
    return { suspiciousAccounts };
};
