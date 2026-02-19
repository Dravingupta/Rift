import { generateRingId } from '../utils/ringIdGenerator.js';

/**
 * Detects Smurfing patterns (Fan-In/Fan-Out).
 * Rules: 10+ unique accounts within 72-hour window.
 * @param {Array} transactions - List of transactions.
 * @returns {Object} - Detected smurfing rings.
 */
export const detectSmurfing = (transactions) => {
    const detectedRings = [];
    const accountsInSmurfing = new Set();
    const WINDOW_MS = 72 * 60 * 60 * 1000; // 72 hours
    const THRESHOLD = 10;

    // Helpers to group transactions
    const sentByAccount = new Map(); // Key: sender, Value: Array of txs
    const receivedByAccount = new Map(); // Key: receiver, Value: Array of txs

    // 1. Group transactions
    for (const tx of transactions) {
        if (!sentByAccount.has(tx.sender_id)) sentByAccount.set(tx.sender_id, []);
        sentByAccount.get(tx.sender_id).push(tx);

        if (!receivedByAccount.has(tx.receiver_id)) receivedByAccount.set(tx.receiver_id, []);
        receivedByAccount.get(tx.receiver_id).push(tx);
    }

    // Helper for sliding window detection
    const checkSlidingWindow = (mainAccount, txs, type) => {
        // Sort by timestamp
        txs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        let left = 0;
        const uniqueCounterparts = new Map(); // Counterpart ID -> count in current window

        for (let right = 0; right < txs.length; right++) {
            const rightTx = txs[right];
            const rightTime = new Date(rightTx.timestamp).getTime();
            const counterpart = type === 'fan_out' ? rightTx.receiver_id : rightTx.sender_id;

            // Add to window
            uniqueCounterparts.set(counterpart, (uniqueCounterparts.get(counterpart) || 0) + 1);

            // Shrink window from left
            while (rightTime - new Date(txs[left].timestamp).getTime() > WINDOW_MS) {
                const leftTx = txs[left];
                const leftCounterpart = type === 'fan_out' ? leftTx.receiver_id : leftTx.sender_id;

                const count = uniqueCounterparts.get(leftCounterpart);
                if (count === 1) {
                    uniqueCounterparts.delete(leftCounterpart);
                } else {
                    uniqueCounterparts.set(leftCounterpart, count - 1);
                }
                left++;
            }

            // Check threshold
            if (uniqueCounterparts.size >= THRESHOLD) {
                // Found a pattern!
                // Collect all unique accounts in this window
                const memberAccounts = Array.from(uniqueCounterparts.keys());
                memberAccounts.push(mainAccount);
                memberAccounts.sort();

                // Avoid duplicate rings (simple check: ring_id is unique per detection call, 
                // but if multiple windows trigger for same set, we might want to dedupe based on members.
                // For simplicity/performance now, we'll store it. If "heavy overlap", treating as single ring 
                // is complex without Union-Find. We'll simply return the window snapshot.)

                // Deduplication strategy: Create a key from sorted members.
                // Only add if not already added.
                const ringKey = memberAccounts.join('|');
                // We'll use a local Set for this run to avoid dupes across sliding window movements
                // But we need to define 'uniqueRings' set outside this loop? 
                // Actually, let's just return the FIRST valid window for a given account to avoid spamming rings for the same burst?
                // OR collect all unique sets.
                return memberAccounts;
            }
        }
        return null;
    };

    // Track unique ring keys to prevent duplicate reports for the same group
    const distinctRings = new Set();

    // 2. Detect Fan-Out (One Sender -> Many Receivers)
    for (const [sender, txs] of sentByAccount) {
        const members = checkSlidingWindow(sender, txs, 'fan_out');
        if (members) {
            const ringKey = members.join('|');
            if (!distinctRings.has(ringKey)) {
                distinctRings.add(ringKey);

                detectedRings.push({
                    ring_id: generateRingId(),
                    member_accounts: members,
                    pattern_type: 'smurfing_fan_out',
                    main_account: sender
                });

                members.forEach(acc => accountsInSmurfing.add(acc));
            }
        }
    }

    // 3. Detect Fan-In (Many Senders -> One Receiver)
    for (const [receiver, txs] of receivedByAccount) {
        const members = checkSlidingWindow(receiver, txs, 'fan_in');
        if (members) {
            const ringKey = members.join('|');
            if (!distinctRings.has(ringKey)) {
                distinctRings.add(ringKey);

                detectedRings.push({
                    ring_id: generateRingId(),
                    member_accounts: members,
                    pattern_type: 'smurfing_fan_in',
                    main_account: receiver
                });

                members.forEach(acc => accountsInSmurfing.add(acc));
            }
        }
    }

    return {
        detectedRings,
        accountsInSmurfing: Array.from(accountsInSmurfing)
    };
};
