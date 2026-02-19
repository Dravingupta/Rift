/**
 * Generates the final JSON output matching the hackathon specification.
 * @param {Object} data - Processed data from all modules.
 * @returns {Object} - Formatted JSON.
 */
export const generateFinalOutput = ({
    suspiciousAccounts,
    cycleResults,
    smurfResults,
    shellResults,
    totalAccounts,
    processingTimeSeconds
}) => {
    // 1. Index suspicious accounts by ID for easy lookup
    const accountMap = new Map();
    suspiciousAccounts.forEach(acc => {
        accountMap.set(acc.account_id, acc);
    });

    // 2. Collect and Format Fraud Rings
    const formattedRings = [];

    // Helper to process rings
    const processRings = (rings, type) => {
        rings.forEach(ring => {
            // Calculate risk score: Average of member suspicion scores
            let totalScore = 0;
            let memberCount = 0;

            ring.member_accounts.forEach(memberId => {
                const acc = accountMap.get(memberId);
                if (acc) {
                    totalScore += acc.suspicion_score;
                    memberCount++;
                }
            });

            const avgScore = memberCount > 0 ? totalScore / memberCount : 0;

            formattedRings.push({
                ring_id: ring.ring_id,
                member_accounts: [...ring.member_accounts].sort(), // Ensure alphabetical sort
                pattern_type: ring.pattern_type || type, // Use existing or fallback
                risk_score: parseFloat(avgScore.toFixed(1))
            });
        });
    };

    processRings(cycleResults.detectedRings, 'cycle');
    processRings(smurfResults.detectedRings, 'smurfing'); // type might be overwritten by pattern_type in ring obj
    processRings(shellResults.detectedRings, 'shell_network');

    // 3. Format Suspicious Accounts
    const formattedAccounts = suspiciousAccounts.map(acc => {
        // Determine primary ring_id
        // Logic: Find all rings this account is part of, pick the one with highest risk_score

        let primaryRingId = null;
        let maxRingScore = -1;

        // We can look through our formattedRings
        formattedRings.forEach(ring => {
            if (ring.member_accounts.includes(acc.account_id)) {
                if (ring.risk_score > maxRingScore) {
                    maxRingScore = ring.risk_score;
                    primaryRingId = ring.ring_id;
                }
            }
        });

        // If no ring found (e.g. high velocity only), primaryRingId remains null or undefined?
        // Project spec example shows "ring_id": "RING_001". 
        // If no ring, maybe omit or null? Spec says "Exact key names". 
        // If it's optional in spec example (not shown as optional), strictly it might be needed.
        // However, unrelated high velocity accounts have no ring.
        // I will set it to null if no ring, or maybe string "N/A" if strict string required.
        // Spec example: "ring_id": "RING_001".
        // I'll leave it as null/undefined if not present, usually JSON stringifies to null.
        // Just in case, let's keep it if truthy.

        const accObj = {
            account_id: acc.account_id,
            suspicion_score: parseFloat(acc.suspicion_score.toFixed(1)),
            detected_patterns: acc.detected_patterns,
            ring_id: primaryRingId
        };

        // Remove ring_id if null? Or keep as null?
        // "No missing fields" -> implies keep it.

        return accObj;
    });

    // 4. Summary
    const summary = {
        total_accounts_analyzed: totalAccounts,
        suspicious_accounts_flagged: formattedAccounts.length,
        fraud_rings_detected: formattedRings.length,
        processing_time_seconds: parseFloat(processingTimeSeconds.toFixed(1))
    };

    // Construct Final Object
    return {
        suspicious_accounts: formattedAccounts,
        fraud_rings: formattedRings,
        summary: summary
    };
};
