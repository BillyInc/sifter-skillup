// âš¡ Sifter SkillUp â€” Starknet Ecosystem Deep Dive
// SENIOR Â· LAB 9 â€” STRATEGIC ECOSYSTEM ANALYSIS
// Part 1 of 2: SQL Primer Micro-Lessons (L0-SQL1 through L0-SQL4) + L9.1 + L9.2
//
// Lab 9 prerequisite: Labs 1â€“8 complete. Intermediate certified.
// Senior level â€” this lab synthesises all prior track skills into original research.
//
// Lab 9 types:
//   SQL Primer: TYPE C (procedural, tool-first â€” Dune SQL in sandbox)
//   L9.1: Mixed TYPE A/C (on-chain query as competitive intelligence)
//   L9.2: TYPE A (judgment â€” systemic risk mapping, contagion chain analysis)
//
// Simulator types introduced or heavily used in this lab:
//   sandbox-sql, sandbox-research-writer, judgment-dataInterpret,
//   judgment-riskAssess, judgment-communication, starkzap-ecosystem-read
//
// v3.0 requirements: Build Task (user-choice-4 + user proposal), Phase 1 task pool,
// Phase 2 portfolio push (narrative document), Final Boss with branch scenarios.

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SQL PRIMER â€” FOUR MICRO-LESSONS (Pre-Lab 9)
// Unlocks before L9.1. No portfolio push. No build task.
// Purpose: SQL instruction that was deferred from Lab 1.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SQL Primer L1 â€” What Is a Database Table?
// TYPE C â€” procedural/tool-first: Dune SQL
// Dominant concept: On-chain data lives in structured tables. A table has rows
// (transactions, events) and columns (fields like address, amount, block_time).
// Knowing this structure is the prerequisite for writing any useful query.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const LAB9_SQL_PRIMER_1 = {
  id: 'l9-sql1-database-table',
  title: 'What Is a Database Table? (And Why On-Chain Data Lives in One)',
  trackType: 'C',
  lessonNumber: 0.1,
  isMicroLesson: true,

  explanation: `
At the end of this micro-lesson, you can read a Dune table preview and identify what each column contains â€” the prerequisite for writing your first SQL query in Primer L2.

Every Starknet transaction is permanently recorded. Every swap, every wallet funding, every contract interaction. By 2024, Starknet has processed over 100 million events. No human can read 100 million individual records. You need a way to ask structured questions across all of them simultaneously. That tool is SQL, and it works because on-chain data is already organised as a database table.

A database table is a grid: rows go across, columns go down. Each row is one record. Each column is one field â€” a piece of information about every record.

The Starknet transactions table looks like this:

block_time          | tx_hash              | from_address         | to_address           | fee_token_amount
--------------------|----------------------|----------------------|----------------------|------------------
2024-01-15 14:22:01 | 0x7a3f...            | 0x03A4...            | 0xAVNU_contract      | 0.0012 ETH
2024-01-15 14:22:03 | 0x8b2c...            | 0x05F9...            | 0xEkubo_contract     | 0.0008 ETH
2024-01-15 14:22:05 | 0x9d1a...            | 0x02B7...            | 0xVesu_contract      | 0.0015 ETH

Each row is one transaction. Each column is one piece of information about that transaction.

WHY THIS MATTERS FOR ECOSYSTEM ANALYSIS

When you want to know "how many unique wallets have used AVNU in the past 30 days," you are asking: "In the starknet.transactions table, how many distinct from_address values appear in rows where to_address = '0xAVNU_contract' AND block_time is within the past 30 days?" That question becomes a SQL query in Primer L2.

When you want to know "which Starknet protocol generated the most transactions last week," you are asking: "In the starknet.transactions table, group rows by to_address, count the rows in each group, sort by count descending, return the top 10." That also becomes a SQL query.

The table structure determines what questions are answerable. Dune organises Starknet data into four primary tables:

starknet.transactions â€” every transaction. Fields: block_time, tx_hash, from_address, to_address, success, fee_token_amount, nonce.

starknet.token_transfers â€” every ERC-20 token movement. Fields: block_time, tx_hash, from_address, to_address, contract_address (the token), amount, symbol.

starknet.events â€” every contract event emitted. Fields: block_time, tx_hash, contract_address, event_name, data (JSON payload of event parameters).

decoded_starknet.[Protocol]_[Contract]_evt_[EventName] â€” decoded versions of specific protocol events. Dune decodes the event data field into human-readable columns. Example: decoded_starknet.avnu_Exchange_evt_Swap has columns: taker_address, sell_token, buy_token, sell_amount, buy_amount.

The decoded tables are where the most useful queries live. Raw event data is hex-encoded. Decoded tables give you named columns you can filter and aggregate directly.

This is called the Dune schema. The failure mode is schema blindness: writing a query without knowing which table contains the field you need, which produces either a zero-result query or an error before it produces any insights.
  `.trim(),

  keyTakeaway: `On-chain data is stored as database tables (rows = individual events, columns = fields like address/amount/time); the Dune schema for Starknet has four primary tables â€” starknet.transactions, starknet.token_transfers, starknet.events, and decoded_starknet.[Protocol]_evt_[EventName] â€” and knowing which table holds what data is the prerequisite for writing any useful query.`,

  examples: [
    {
      contextTag: '[Dune table selection mistake and correction]',
      context: 'An analyst wants to find the volume of USDC flowing through AVNU in the past 7 days.',
      scenario: 'She queries starknet.transactions, filtering by to_address = AVNU contract. She gets 18,000 rows but no volume data â€” the transactions table has fee_token_amount but not the traded amounts. She switches to decoded_starknet.avnu_Exchange_evt_Swap, which has sell_amount and buy_amount columns. Total USDC volume: $8.2M over 7 days.',
      outcome: 'Correct table selection: decoded tables for protocol-specific volume data, not the base transactions table. The failure mode (querying the wrong table) produces zero useful output â€” it does not error, it just returns the wrong fields.',
    },
    {
      contextTag: '[Schema navigation to answer a cross-protocol question]',
      context: 'An analyst wants to identify which wallets use both Ekubo and Vesu â€” potential power users of the Starknet ecosystem.',
      scenario: 'He queries decoded_starknet.ekubo_Core_evt_Swap for wallet addresses (taker field) and decoded_starknet.vesu_Singleton_evt_ModifyPosition for wallet addresses (sender field). He then writes a query that returns addresses appearing in BOTH tables â€” the intersection. Result: 847 addresses use both protocols.',
      outcome: '847 multi-protocol users identified from two decoded event tables. This kind of cross-protocol analysis is impossible from any API dashboard â€” it requires knowing that both event types are in decoded tables and writing a query that intersects them.',
    },
    {
      contextTag: '[token_transfers table for staking analysis]',
      context: 'A researcher wants to track the growth of STRK staking participation over time.',
      scenario: 'She queries starknet.token_transfers where to_address = known STRK staking contract and contract_address = STRK token address. She groups by DATE_TRUNC(\'week\', block_time) and sums the amount column. Output: weekly STRK inflows to the staking contract over 6 months, showing a 340% increase from week 1 to week 26.',
      outcome: 'The token_transfers table (not transactions or events) is correct here because staking is a token movement to a specific contract. Correct table selection enables a 6-month staking trend in one query.',
    },
  ],

  guidedPractice: [
    {
      question: 'Which Dune table would you query to find the number of USDC transfers to a specific Starknet lending protocol last month?',
      options: ['A. starknet.transactions â€” all transaction metadata', 'B. starknet.token_transfers â€” all ERC-20 token movements with amount and symbol columns', 'C. starknet.events â€” all contract events as hex-encoded data', 'D. decoded_starknet.transactions â€” does not exist'],
      correct: 1,
      explanation: 'B is correct. starknet.token_transfers contains ERC-20 token movements with the contract_address (which token), from_address, to_address, amount, and symbol fields. To find USDC transfers: filter where symbol = \'USDC\' AND to_address = lending protocol address AND block_time in range. The transactions table (A) has fee data but not traded token amounts. The events table (C) has the same data but in hex â€” unusable without decoding.',
    },
    {
      question: 'A decoded event table for AVNU swaps has columns: taker_address, sell_token, buy_token, sell_amount, buy_amount. What does each row represent?',
      options: ['A. Each row is one wallet', 'B. Each row is one swap transaction â€” one instance of a user exchanging sell_amount of sell_token for buy_amount of buy_token', 'C. Each row is one day of trading', 'D. Each row is one liquidity pool'],
      correct: 1,
      explanation: 'B is correct. In any event table, each row is one event emission â€” one time the smart contract fired that event. For a swap event, each row is one individual swap: who traded (taker_address), what they sold (sell_token, sell_amount), and what they received (buy_token, buy_amount). One wallet performing 50 swaps generates 50 rows.',
    },
    {
      question: 'Why use decoded_starknet.avnu_Exchange_evt_Swap instead of starknet.events for AVNU volume analysis?',
      options: ['A. decoded tables have more rows', 'B. starknet.events stores the event data as a hex-encoded JSON payload that requires parsing before use. decoded_starknet tables have already converted that payload into named columns (sell_amount, buy_amount) you can directly filter and sum.', 'C. starknet.events does not contain AVNU data', 'D. decoded tables update faster'],
      correct: 1,
      explanation: 'B is correct. starknet.events.data is a raw hex field â€” to get AVNU sell_amount from it you would need to write a custom hex decoder for each field. Dune\'s decoded tables perform this decoding in advance, giving you sell_amount as a numeric field you can directly SUM. The decoded table is the same data, already cleaned â€” always prefer it when it exists.',
    },
    {
      question: 'You want to find all wallets that have made more than 100 transactions on Starknet in the past 30 days. Which table do you start with?',
      options: ['A. starknet.token_transfers â€” highest transaction count', 'B. starknet.transactions â€” contains from_address and block_time for every transaction. GROUP BY from_address, COUNT rows, filter COUNT > 100', 'C. decoded_starknet tables â€” more accurate counts', 'D. starknet.events â€” captures all activity'],
      correct: 1,
      explanation: 'B is correct. starknet.transactions is the base table for counting activity per wallet â€” every transaction produces exactly one row here with from_address. You GROUP BY from_address, COUNT(*), filter WHERE block_time in range, and ORDER BY count. The token_transfers table (A) would count token movement events, not transactions â€” a user might generate 3 token transfers per transaction. starknet.transactions is the correct unit.',
    },
    {
      question: 'An analyst queries starknet.token_transfers for USDC volume but gets results showing much higher volume than DefiLlama reports. Most likely cause?',
      options: ['A. DefiLlama data is wrong', 'B. starknet.token_transfers captures every USDC transfer including internal protocol-to-protocol routing transfers (one user swap can generate 3â€“4 internal USDC movements). To get user-facing volume only, query the decoded swap event table (sell_amount + buy_amount per wallet), which counts the user\'s intended trade, not each leg of the protocol\'s internal routing.', 'C. The analyst filtered by the wrong date range', 'D. USDC has multiple contract addresses on Starknet'],
      correct: 1,
      explanation: 'B is correct. A single AVNU swap on Starknet might route through Ekubo and two liquidity pools, generating 4 USDC transfer events â€” but the user only performed one swap of $1,000. Summing raw token_transfers counts each internal leg, inflating the figure. The decoded swap event table counts the user\'s trade at source (sell_amount), producing the correct $1,000 figure. This is the most common volume overcount error.',
    },
  ],

  lessonSimulations: [
    {
      type: 'sandbox-sql',
      scenario: 'Open the sandbox-sql simulator. The mock dataset includes a preview of the starknet.transactions table (1,000 sample rows). Identify: (1) what fields are in the table, (2) which field uniquely identifies each transaction, (3) which field would you use to filter for transactions to a specific contract address, and (4) which field would you use to count activity over time.',
      scoringCriteria: ['Fields correctly identified: block_time, tx_hash, from_address, to_address, success, fee_token_amount, nonce', 'Unique identifier: tx_hash (unique per transaction)', 'Filter for contract: to_address â€” the address the transaction was sent to', 'Time-based counting: block_time â€” used with DATE_TRUNC or direct range filtering'],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A Dune query returns 245,000 rows from starknet.token_transfers for USDC in the past 7 days. A separate query on decoded_starknet.avnu_Exchange_evt_Swap for the same period returns 62,000 rows. What explains the difference, and which number more accurately represents "USDC trading activity on Starknet this week"?',
      scoringCriteria: ['Correctly explains the 3.9Ã— difference: token_transfers includes every internal USDC transfer leg generated by protocol routing (each swap route may produce 2â€“5 USDC transfers)', 'Correctly identifies 62,000 decoded swap rows as the more accurate "user-facing USDC trading activity" figure â€” one row per user swap, not per internal transfer', 'Notes additional inflation source: bridging transfers and wallet-to-wallet transfers are also in token_transfers but are not trading activity'],
    },
    {
      type: 'judgment-communication',
      scenario: 'A journalist asks you to explain "why analysts use Dune instead of just looking at a blockchain explorer for Starknet data." Write a two-sentence answer that explains the limitation of explorers and the advantage of SQL tables â€” no technical jargon.',
      scoringCriteria: ['Limitation of explorers correctly stated: explorers show individual transactions one at a time â€” they cannot aggregate, filter, or compare across millions of records simultaneously', 'SQL advantage correctly stated: SQL queries ask structured questions across the entire dataset (e.g., "total unique wallets per week") and return answers in seconds, enabling ecosystem-wide analysis impossible from one-at-a-time exploration'],
    },
  ],
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SQL Primer L2 â€” The Four SQL Statements
// TYPE C â€” SELECT, WHERE, GROUP BY, ORDER BY in Starknet context
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const LAB9_SQL_PRIMER_2 = {
  id: 'l9-sql2-four-statements',
  title: 'The Four SQL Statements You Need (SELECT, WHERE, GROUP BY, ORDER BY)',
  trackType: 'C',
  lessonNumber: 0.2,
  isMicroLesson: true,

  explanation: `
At the end of this micro-lesson, you can write a complete SQL query answering any of the four core Starknet data questions: daily active users, volume trend, protocol ranking, or staking participation.

Four SQL statements compose every useful on-chain query. No SQL theory. Each statement is taught through a specific Starknet data question.

STATEMENT 1 â€” SELECT: "What columns do I want to see?"

SELECT specifies which columns appear in your result. Everything else filters, groups, or sorts the data â€” SELECT determines which fields your answer contains.

Question: "Show me all recent AVNU swaps with wallet address, sell amount, and buy amount."
Answer:
  SELECT taker_address, sell_amount, buy_token
  FROM decoded_starknet.avnu_Exchange_evt_Swap
  LIMIT 100;

SELECT taker_address, sell_amount, buy_token â€” I want these three columns in my result.
FROM decoded_starknet.avnu_Exchange_evt_Swap â€” from this specific table.
LIMIT 100 â€” stop after 100 rows (always use LIMIT when exploring to avoid reading millions of rows).

STATEMENT 2 â€” WHERE: "Which rows do I want?"

WHERE filters rows based on conditions. Only rows matching ALL your conditions are kept.

Question: "How many AVNU swaps in the past 7 days involved more than $500 of sell amount?"
Answer:
  SELECT COUNT(*) AS total_swaps
  FROM decoded_starknet.avnu_Exchange_evt_Swap
  WHERE block_time >= NOW() - INTERVAL '7 days'
    AND sell_amount > 500 * 1e18;   -- amounts are stored in wei (18 decimal places)

WHERE block_time >= NOW() - INTERVAL '7 days' â€” only rows from the past 7 days.
AND sell_amount > 500 * 1e18 â€” only rows where the sell amount exceeds $500.
COUNT(*) â€” count all matching rows.
AS total_swaps â€” name the result column "total_swaps".

Note on decimals: ERC-20 amounts on Starknet are stored as integers with 18 decimal places. 1 USDC stored as "1000000" (6 decimals). 1 ETH stored as "1000000000000000000" (18 decimals). Always divide by 10^decimals when displaying amounts in human-readable form.

STATEMENT 3 â€” GROUP BY: "Aggregate by category"

GROUP BY collapses rows with the same value in the specified column into one result row, applying an aggregate function (COUNT, SUM, AVG) to the collapsed rows.

Question: "How many AVNU swaps happened each day in the past 30 days?"
Answer:
  SELECT
    DATE_TRUNC('day', block_time) AS trade_date,
    COUNT(*) AS daily_swaps,
    SUM(sell_amount) / 1e18 AS daily_volume_eth
  FROM decoded_starknet.avnu_Exchange_evt_Swap
  WHERE block_time >= NOW() - INTERVAL '30 days'
  GROUP BY DATE_TRUNC('day', block_time)
  ORDER BY trade_date ASC;

DATE_TRUNC('day', block_time) â€” round every timestamp to the nearest day (strips hours/minutes). This collapses all transactions from the same day into one group.
COUNT(*) â€” count rows per day group.
SUM(sell_amount) / 1e18 â€” sum the sell amounts for each day group, divide to human-readable ETH.
ORDER BY trade_date ASC â€” sort oldest to newest (for a trend chart).

STATEMENT 4 â€” ORDER BY: "Sort the results"

ORDER BY sorts your result set. ASC = ascending (smallest first). DESC = descending (largest first). Combined with LIMIT, it produces top-N rankings.

Question: "Which 10 wallets have executed the most Ekubo swaps in the past 30 days?"
Answer:
  SELECT
    sender AS wallet_address,
    COUNT(*) AS swap_count,
    SUM(amount0 + amount1) / 1e18 AS total_volume
  FROM decoded_starknet.ekubo_Core_evt_Swap
  WHERE block_time >= NOW() - INTERVAL '30 days'
  GROUP BY sender
  ORDER BY swap_count DESC
  LIMIT 10;

ORDER BY swap_count DESC â€” sort by the COUNT result, highest first.
LIMIT 10 â€” return only the top 10.

COMPOSING THE FOUR STATEMENTS

The statements always appear in this order: SELECT â†’ FROM â†’ WHERE â†’ GROUP BY â†’ ORDER BY â†’ LIMIT.
You may omit any of WHERE, GROUP BY, ORDER BY, LIMIT â€” but the ones you use must be in this sequence.

The query lifecycle: FROM selects the table. WHERE filters rows. GROUP BY collapses into groups. SELECT computes the output columns. ORDER BY sorts results. LIMIT caps the row count.
  `.trim(),

  keyTakeaway: `SELECT specifies output columns, WHERE filters rows, GROUP BY aggregates into categories, and ORDER BY sorts results â€” always in that sequence, composing into every meaningful Starknet on-chain query, with the critical detail that ERC-20 amounts are stored as integers with 6â€“18 decimal places that must be divided before displaying human-readable values.`,

  examples: [
    {
      contextTag: '[Daily active user query in practice]',
      context: 'An analyst wants to track Ekubo\'s daily unique users over the past 14 days for a competitive report.',
      scenario: 'She writes: SELECT DATE_TRUNC(\'day\', block_time) AS day, COUNT(DISTINCT sender) AS unique_users FROM decoded_starknet.ekubo_Core_evt_Swap WHERE block_time >= NOW() - INTERVAL \'14 days\' GROUP BY day ORDER BY day ASC. Result: 14 rows, each showing a date and unique wallet count. Day 1: 412 users. Day 14: 578 users. 40% growth in 2 weeks.',
      outcome: 'The four statements combine into a DAU trend. COUNT(DISTINCT sender) â€” not COUNT(*) â€” is critical here: one wallet executing 20 swaps in a day is 1 active user, not 20. DISTINCT collapses duplicate wallets within each day group.',
    },
    {
      contextTag: '[Protocol volume ranking]',
      context: 'A researcher needs to rank all Starknet DEXs by 7-day volume for a competitive landscape section.',
      scenario: 'He joins multiple decoded swap tables using UNION ALL, adding a protocol name field to each: SELECT \'AVNU\' as protocol, SUM(sell_amount)/1e18 as volume FROM decoded_starknet.avnu_Exchange_evt_Swap WHERE ... UNION ALL SELECT \'Ekubo\' as protocol, SUM(amount0)/1e18 as volume FROM decoded_starknet.ekubo_Core_evt_Swap WHERE ... ORDER BY volume DESC. Result: Ekubo $18M, AVNU $8M, JEDI $2M.',
      outcome: 'Protocol ranking from on-chain data uses UNION ALL to stack results from multiple decoded tables, then ORDER BY volume DESC to rank. The result is more accurate than any dashboard because it draws directly from event data rather than API estimates.',
    },
    {
      contextTag: '[WHERE clause with decimal conversion]',
      context: 'An analyst wants swaps where a user bought more than $1,000 of STRK.',
      scenario: 'STRK has 18 decimal places. She writes WHERE buy_token = \'0xSTRK_address\' AND buy_amount > 1000 * 1e18. Without the 1e18 multiplier, the filter would require a raw integer >1000 â€” which is 0.000000000000001 STRK, not $1,000 STRK. With the correct multiplier, the filter correctly identifies large STRK purchases.',
      outcome: 'Decimal conversion is the most common beginner SQL error on blockchain data. Always multiply human-readable thresholds by 10^(token_decimals) in WHERE clauses. USDC uses 1e6. ETH and STRK use 1e18.',
    },
  ],

  guidedPractice: [
    {
      question: 'Write the correct SQL structure to count total Vesu deposit events per week over the past 8 weeks. Which statements do you need?',
      options: ['A. SELECT + FROM + ORDER BY only', 'B. SELECT DATE_TRUNC(\'week\', block_time) AS week, COUNT(*) AS deposits FROM decoded_starknet.vesu_Singleton_evt_ModifyPosition WHERE block_time >= NOW() - INTERVAL \'8 weeks\' GROUP BY week ORDER BY week ASC', 'C. SELECT + WHERE only â€” no grouping needed', 'D. GROUP BY + ORDER BY without SELECT'],
      correct: 1,
      explanation: 'B is correct. All four statements are needed: SELECT specifies the week bucket and count, FROM identifies the Vesu decoded table, WHERE restricts to 8 weeks, GROUP BY DATE_TRUNC(\'week\', block_time) collapses by week, ORDER BY week ASC shows oldest to newest. Omitting GROUP BY would return one row per deposit event, not one row per week.',
    },
    {
      question: 'A query returns buy_amount = 850000000000000000000 for a STRK purchase (18 decimals). What is the human-readable amount?',
      options: ['A. 850 quadrillion STRK', 'B. 850 STRK (850000000000000000000 Ã· 10^18)', 'C. 850 million STRK', 'D. 0.00085 STRK'],
      correct: 1,
      explanation: 'B is correct. STRK uses 18 decimal places (like ETH). 850000000000000000000 Ã· 10^18 = 850 STRK. This is a fundamental property of ERC-20 token storage on EVM-compatible chains â€” amounts are stored as integers to avoid floating-point precision errors. Always divide by 10^decimals.',
    },
    {
      question: 'You want the top 5 most active wallets on Starknet by transaction count in the past 7 days. What goes in ORDER BY and LIMIT?',
      options: ['A. ORDER BY block_time DESC LIMIT 5', 'B. ORDER BY tx_count DESC LIMIT 5 â€” sorts by the COUNT(*) result alias, highest first, returns top 5', 'C. ORDER BY from_address ASC LIMIT 5', 'D. No ORDER BY or LIMIT needed'],
      correct: 1,
      explanation: 'B is correct. After GROUP BY from_address with COUNT(*) AS tx_count, ORDER BY tx_count DESC sorts by the computed count, highest wallets first. LIMIT 5 returns only the top 5. ORDER BY block_time DESC (A) would sort by the most recent transaction time within each group, not by count. ASC (C) would give the least active wallets.',
    },
    {
      question: 'In the query SELECT COUNT(*) FROM starknet.transactions WHERE to_address = \'0xAVNU\' AND block_time >= NOW() - INTERVAL \'30 days\', what does WHERE do?',
      options: ['A. Sorts the results by address', 'B. Filters rows before counting â€” only rows where to_address is AVNU AND block_time is within 30 days are counted. Rows not matching both conditions are excluded entirely.', 'C. Groups transactions by address', 'D. Selects which columns to display'],
      correct: 1,
      explanation: 'B is correct. WHERE is a row filter â€” it evaluates each row before any aggregation. Only rows satisfying ALL conditions pass through to COUNT. The AND operator means both conditions must be true simultaneously: a transaction sent to AVNU that occurred more than 30 days ago would be excluded (fails the time condition).',
    },
    {
      question: 'A query returns the same wallet address in 12 separate rows of results after a GROUP BY. What went wrong?',
      options: ['A. The wallet made 12 transactions â€” this is correct behaviour', 'B. The GROUP BY is on a column that is not perfectly consistent â€” e.g., GROUP BY DATE_TRUNC(\'day\', block_time) instead of GROUP BY sender. The wallet appears once per day rather than once total. To collapse by wallet across all days, GROUP BY sender (wallet address), not by time bucket.', 'C. COUNT(*) counted wrong', 'D. The LIMIT is too high'],
      correct: 1,
      explanation: 'B is correct. GROUP BY collapses rows that have the same value in the specified column. If you GROUP BY DATE_TRUNC(\'day\', block_time), each unique day becomes one group â€” a wallet active on 12 days produces 12 rows, one per day. To get one row per wallet across all time, GROUP BY sender. The GROUP BY column determines the unit of analysis, not the filter.',
    },
  ],

  lessonSimulations: [
    {
      type: 'sandbox-sql',
      scenario: 'Write a query that returns the 10 wallets with the highest total AVNU swap volume (in human-readable ETH, not wei) over the past 30 days. Use decoded_starknet.avnu_Exchange_evt_Swap with the sell_amount column. Include: wallet address, total_volume_eth (sell_amount / 1e18), swap_count. Sort by total_volume_eth DESC.',
      scoringCriteria: ['Correct SELECT: taker_address (or equivalent field), SUM(sell_amount)/1e18 AS total_volume_eth, COUNT(*) AS swap_count', 'Correct FROM: decoded_starknet.avnu_Exchange_evt_Swap', 'Correct WHERE: block_time >= NOW() - INTERVAL \'30 days\'', 'Correct GROUP BY: taker_address', 'Correct ORDER BY: total_volume_eth DESC', 'Correct LIMIT: 10'],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A query returns: Date: 2024-01-08, daily_users: 820. Date: 2024-01-09, daily_users: 1,450. Date: 2024-01-10, daily_users: 1,380. Date: 2024-01-11, daily_users: 960. Date: 2024-01-12, daily_users: 850. What happened on Jan 9th and what additional query would you run to understand it?',
      scoringCriteria: ['Identifies Jan 9th as an anomaly: 77% spike in daily users (820 â†’ 1,450), followed by rapid normalisation â€” consistent with a one-day event rather than a structural change', 'Proposes follow-up query: SELECT to_address, COUNT(DISTINCT from_address) FROM starknet.transactions WHERE DATE_TRUNC(\'day\', block_time) = \'2024-01-09\' GROUP BY to_address ORDER BY COUNT DESC â€” identify which protocol received the spike, suggesting an airdrop, launch event, or incentive campaign', 'Correctly notes that a single-day spike followed by full reversal is event-driven, not organic growth'],
    },
    {
      type: 'judgment-communication',
      scenario: 'A Foundation program manager who does not write code asks you: "I\'ve heard SQL can tell us who our most active users are. What does that actually mean and how long does it take?" Give a 3-sentence non-technical answer that is accurate about SQL capability and query time.',
      scoringCriteria: ['SQL capability correctly explained: SQL can rank every wallet that has ever interacted with a Starknet protocol by their activity count (transactions, volume, frequency) â€” across the entire history in one query', 'Time correctly stated: a well-written query on Dune returns results in 10â€“60 seconds for 30-day windows; 6-month queries may take 2â€“5 minutes', 'No jargon used: does not mention SELECT, GROUP BY, or schema without defining them'],
    },
  ],
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SQL Primer L3 â€” The Starknet Dune Schema
// TYPE C â€” schema map: which tables contain what data
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const LAB9_SQL_PRIMER_3 = {
  id: 'l9-sql3-dune-schema',
  title: 'The Starknet Dune Schema (What Tables Exist and What Each Contains)',
  trackType: 'C',
  lessonNumber: 0.3,
  isMicroLesson: true,

  explanation: `
At the end of this micro-lesson, you have a reference map of the Starknet Dune schema â€” every table you will use in Lab 9 queries, with the key fields and the specific data question each table answers.

Dune organises Starknet data in two tiers: raw tables (all data, unprocessed) and decoded tables (protocol-specific events, pre-parsed into named columns).

TIER 1 â€” RAW TABLES

starknet.transactions
Contains: every transaction on Starknet.
Key fields: block_time, block_number, tx_hash, from_address, to_address, success, actual_fee (in wei), type (INVOKE, DECLARE, DEPLOY), nonce.
Use for: wallet activity counts, protocol transaction volumes, fee analysis, network-wide activity trends.
Do NOT use for: token amounts traded (not stored here), decoded event data.

starknet.token_transfers
Contains: every ERC-20 token transfer event.
Key fields: block_time, tx_hash, from_address, to_address, contract_address (the token contract), symbol, amount (in raw units, divide by decimals).
Use for: tracking specific token flows (USDC, STRK, ETH) to/from specific addresses; measuring staking inflows; identifying bridge flows.
Do NOT use for: protocol-specific trade data (swap routing creates multiple transfer legs per trade â€” overcounts user-facing volume).

starknet.events
Contains: every smart contract event as raw encoded data.
Key fields: block_time, tx_hash, contract_address, event_name, keys (array), data (array of hex values).
Use for: checking if an event type exists before it has a decoded table; rare events not yet decoded by Dune.
Do NOT use for: any analysis where you need readable values â€” data field is hex-encoded and requires custom parsing.

TIER 2 â€” DECODED TABLES (use these when available)

Decoded tables are named: decoded_starknet.[Protocol]_[Contract]_evt_[EventName]

KEY DECODED TABLES FOR STARKNET ECOSYSTEM ANALYSIS:

decoded_starknet.avnu_Exchange_evt_Swap
Protocol: AVNU (DEX aggregator)
Event: Swap
Key fields: block_time, tx_hash, taker_address, sell_token, buy_token, sell_amount, buy_amount, beneficiary.
Use for: AVNU volume, unique traders, token pair analysis.

decoded_starknet.ekubo_Core_evt_Swap
Protocol: Ekubo (concentrated AMM)
Event: Swap
Key fields: block_time, tx_hash, pool_key (struct), sender, recipient, delta (tuple of amount0/amount1).
Use for: Ekubo volume, pool concentration, large trade analysis.

decoded_starknet.vesu_Singleton_evt_ModifyPosition
Protocol: Vesu (lending)
Event: ModifyPosition (fires on every deposit, borrow, repay, or withdraw)
Key fields: block_time, tx_hash, pool_id, collateral_asset, debt_asset, position_owner, collateral_delta, debt_delta.
Use for: Vesu TVL changes, borrow growth, unique borrowers.

decoded_starknet.nostra_Market_evt_Deposit and _evt_Borrow
Protocol: Nostra (lending)
Events: Deposit, Borrow
Key fields: block_time, tx_hash, user, amount, asset.
Use for: Nostra TVL and borrow comparison with Vesu.

extended_starknet.extended_evt_TradeExecuted
Protocol: Extended (perpetuals)
Event: TradeExecuted
Key fields: block_time, tx_hash, trader_address, market, direction, size, entry_price.
Use for: Extended open interest, active traders, market distribution.

SCHEMA DECISION TREE

"I want to count unique wallets on a specific protocol" â†’ decoded_[protocol]_evt_[main event], SELECT COUNT(DISTINCT sender/taker/user)

"I want volume of a specific protocol" â†’ decoded_[protocol]_evt_Swap, SUM(sell_amount) or SUM(buy_amount)

"I want total STRK/USDC/ETH moving to a contract" â†’ starknet.token_transfers, filter by contract_address (token) and to_address (target contract)

"I want transaction counts across all protocols" â†’ starknet.transactions, GROUP BY to_address

"I want a field that doesn't exist in decoded tables" â†’ starknet.events, but parse data field manually (advanced)

This is called schema fluency. The failure mode is schema confusion: trying to get token amounts from starknet.transactions, or trying to get readable values from starknet.events.data, or querying the wrong protocol's decoded table. Each of these errors produces either empty results or nonsense values without an error message.
  `.trim(),

  keyTakeaway: `The Starknet Dune schema has two tiers â€” raw tables (starknet.transactions, starknet.token_transfers, starknet.events) for broad network data and decoded tables (decoded_starknet.[Protocol]_evt_[Event]) for protocol-specific analysis â€” and schema fluency means knowing which tier answers which data question before writing a single line of SQL.`,

  examples: [
    {
      contextTag: '[Schema selection for competitive DEX analysis]',
      context: 'An analyst wants to compare AVNU vs Ekubo on 30-day volume and unique traders.',
      scenario: 'For AVNU: decoded_starknet.avnu_Exchange_evt_Swap â€” SUM(sell_amount)/1e18 for volume, COUNT(DISTINCT taker_address) for traders. For Ekubo: decoded_starknet.ekubo_Core_evt_Swap â€” different field names (delta instead of sell_amount). She checks the Dune table schema tab to confirm field names before writing. Result: AVNU 48,000 unique traders, Ekubo 31,000 â€” but Ekubo has 3Ã— the volume.',
      outcome: 'Schema lookup before writing saves 20 minutes of debugging. Different protocols use different field names in their events. Always check the table preview in Dune before querying a new decoded table.',
    },
    {
      contextTag: '[token_transfers for staking flow analysis]',
      context: 'A researcher tracks how much STRK flowed into the staking contract each month since January 2024.',
      scenario: 'He uses starknet.token_transfers WHERE contract_address = \'0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d\' (STRK token contract) AND to_address = \'0x[staking_contract]\'. Monthly SUM(amount)/1e18 shows: Jan $8M, Feb $22M, Mar $41M, Apr $67M â€” accelerating adoption.',
      outcome: 'token_transfers is the correct choice for tracking a specific token\'s inflow to a contract. The token contract address goes in contract_address. The staking contract goes in to_address. Mixing these up produces zero results or counts all STRK transfers ecosystem-wide.',
    },
    {
      contextTag: '[Schema gap — unlisted protocol]',
      context: 'An analyst wants to query trading data for a newer Starknet DEX that launched 3 months ago.',
      scenario: 'She checks Dune: no decoded table exists for this protocol yet. She falls back to starknet.events WHERE contract_address = \'0x[new_dex_contract]\' AND event_name = \'Swap\'. This returns rows but data is hex-encoded â€” she can count swap events (COUNT(*)) but cannot extract amounts without building a custom hex parser.',
      outcome: 'When decoded tables don\'t exist: COUNT(*) for transaction/event counts is possible from starknet.events; volume analysis requires waiting for Dune to add a decoded table or writing a custom submission to the Dune Spellbook. The absence of a decoded table is itself a signal â€” newer or smaller protocols have less ecosystem tooling coverage.',
    },
  ],

  guidedPractice: [
    {
      question: 'Which table do you query to measure how many unique wallets borrowed from Vesu in the past 90 days?',
      options: ['A. starknet.transactions â€” use to_address = Vesu contract', 'B. decoded_starknet.vesu_Singleton_evt_ModifyPosition â€” filter WHERE debt_delta > 0 (borrow increases debt), COUNT(DISTINCT position_owner)', 'C. starknet.token_transfers â€” filter USDC transfers to Vesu', 'D. starknet.events â€” Vesu emits BorrowEvent'],
      correct: 1,
      explanation: 'B is correct. The Vesu decoded event table ModifyPosition covers deposits, borrows, repays, and withdrawals in one event type. debt_delta > 0 identifies borrows (increasing debt), debt_delta < 0 identifies repayments. COUNT(DISTINCT position_owner) counts unique wallets that have borrowed. Option A (transactions) would count every transaction to Vesu â€” including UI-level interactions that don\'t change positions. Option C (token_transfers) would capture USDC inflows but not distinguish borrows from LP deposits.',
    },
    {
      question: 'You want to find which tokens were most traded on AVNU last week. Which table and which field?',
      options: ['A. starknet.token_transfers â€” sum by symbol', 'B. decoded_starknet.avnu_Exchange_evt_Swap â€” GROUP BY buy_token, SUM(buy_amount) â€” shows which tokens users were buying', 'C. starknet.transactions â€” GROUP BY to_address', 'D. starknet.events â€” Swap event data field'],
      correct: 1,
      explanation: 'B is correct. decoded_starknet.avnu_Exchange_evt_Swap has buy_token (the token purchased) and buy_amount (how much was purchased) as named columns. GROUP BY buy_token, SUM(buy_amount) gives a ranked list of purchased tokens. GROUP BY sell_token gives what was sold. The token_transfers table (A) would work but overcounts internal routing transfers â€” the decoded table is more accurate for user-facing trade data.',
    },
    {
      question: 'A decoded table for Extended perpetuals has a size field. You query SUM(size) and get 17,400,000,000,000,000,000,000. After dividing by 1e18, the result is 17,400,000. Is this plausible open interest for a Starknet perps protocol?',
      options: ['A. Yes â€” $17.4M open interest is consistent with Starknet Extended\'s reported figures (~$8-20M range)', 'B. No â€” the result should be $0', 'C. No â€” the result should be $17.4B which is Hyperliquid-scale', 'D. Cannot be assessed without knowing current STRK price'],
      correct: 0,
      explanation: 'A is correct. After correct decimal conversion (Ã· 1e18), $17.4M open interest aligns with Extended\'s known scale. Starknet perpetuals are early-stage: Lab 8 established Extended has ~$8-20M open interest. Hyperliquid ($3B+) and dYdX are orders of magnitude larger. The plausibility check (does the number make sense for the protocol\'s known scale?) is a required quality check after every volume or balance query.',
    },
    {
      question: 'You need to identify whether Ekubo or AVNU generated more fee revenue last month. Which approach is most accurate?',
      options: ['A. Query starknet.transactions, filter by each contract address, sum actual_fee', 'B. Query each protocol\'s decoded swap event table â€” calculate revenue as volume Ã— fee_tier for each protocol. AVNU: decoded_starknet.avnu_Exchange_evt_Swap (fee = sell_amount Ã— aggregator_margin ~0.05%). Ekubo: decoded_starknet.ekubo_Core_evt_Swap (fee = pool-configured fee tier, typically 0.05â€“0.3%).', 'C. Check DefiLlama â€” more accurate than raw data', 'D. starknet.token_transfers â€” sum fees paid to each contract'],
      correct: 1,
      explanation: 'B is correct. Protocol revenue is best measured from decoded swap events: volume Ã— fee_tier = fee revenue. starknet.transactions.actual_fee (A) is the gas fee paid to the network, not the protocol\'s trading fee â€” a completely different metric. DefiLlama (C) is useful for cross-checking but queries Dune data directly for the most accurate result. The fee tier varies by pool on Ekubo, which requires joining pool configuration data â€” an advanced query, but the correct approach.',
    },
    {
      question: 'Which Dune table is the WRONG choice for measuring "how much ETH has been deposited into Vesu as collateral in the past week"?',
      options: ['A. decoded_starknet.vesu_Singleton_evt_ModifyPosition â€” filter WHERE collateral_asset = ETH_address AND collateral_delta > 0', 'B. starknet.events â€” filter WHERE contract_address = Vesu AND event_name = \'ModifyPosition\'', 'C. starknet.transactions â€” filter WHERE to_address = Vesu contract AND sum actual_fee', 'D. starknet.token_transfers â€” filter WHERE to_address = Vesu AND contract_address = ETH_address'],
      correct: 2,
      explanation: 'C is the wrong choice. starknet.transactions.actual_fee measures the gas cost of transactions sent to Vesu â€” the network fee paid to sequencers, not the ETH collateral deposited into the lending protocol. You would get the gas cost of interacting with Vesu, not the collateral amounts. Options A, B, and D would all reach ETH collateral data through different routes (A is the cleanest), making C the uniquely wrong choice.',
    },
  ],

  lessonSimulations: [
    {
      type: 'sandbox-sql',
      scenario: 'Open the mock Dune dataset. You need to compare how many transactions AVNU vs Ekubo vs Vesu received in the past 30 days. Write a single query using starknet.transactions that returns: protocol_name (derived from to_address), tx_count, unique_wallets. Use CASE WHEN to map known contract addresses to protocol names.',
      scoringCriteria: ['Uses starknet.transactions as FROM table', 'Uses CASE WHEN to_address = \'0xAVNU\' THEN \'AVNU\' WHEN to_address = \'0xEkubo\' THEN \'Ekubo\' WHEN to_address = \'0xVesu\' THEN \'Vesu\' END AS protocol_name â€” or equivalent', 'WHERE to_address IN (AVNU, Ekubo, Vesu contracts) AND block_time in range', 'GROUP BY protocol_name', 'SELECT COUNT(*) AS tx_count, COUNT(DISTINCT from_address) AS unique_wallets', 'ORDER BY tx_count DESC'],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Dune shows: decoded_starknet.avnu_Exchange_evt_Swap exists with 2.3M rows. decoded_starknet.ekubo_Core_evt_Swap exists with 8.1M rows. decoded_starknet.extended_evt_TradeExecuted exists with 340,000 rows. No decoded table exists for a newer Starknet DEX called "Karak." What does the absence of the Karak decoded table tell you, and how would you estimate Karak\'s transaction count without it?',
      scoringCriteria: ['Absence of decoded table indicates: (1) Karak is new enough that Dune has not yet decoded its events, OR (2) Karak is small enough that no community contributor has submitted a decoder to Dune Spellbook â€” absence is correlated with smaller protocols', 'Estimation approach: query starknet.transactions WHERE to_address = Karak_contract AND block_time in range, COUNT(*). This gives transaction count (not event count, not volume) â€” a lower-fidelity metric but the only option without a decoded table'],
    },
    {
      type: 'judgment-communication',
      scenario: 'A competitor analyst publishes a report claiming "AVNU has 48,000 unique users based on starknet.token_transfers data." You know this is methodologically wrong. Write a two-sentence correction that is technically accurate without being condescending.',
      scoringCriteria: ['Correctly identifies the error: starknet.token_transfers counts token transfer recipients â€” not the wallets initiating AVNU swaps. A single AVNU swap generates 2-4 token transfers (routing legs), inflating the unique address count vs the actual unique trader count.', 'Provides correct method: unique user count should use COUNT(DISTINCT taker_address) from decoded_starknet.avnu_Exchange_evt_Swap â€” one row per user-initiated swap, not one row per internal token movement'],
    },
  ],
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SQL Primer L4 â€” Running Queries in the App
// TYPE C â€” query execution workflow in sandbox-sql
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const LAB9_SQL_PRIMER_4 = {
  id: 'l9-sql4-running-queries',
  title: 'Running Queries in the App (sandbox-sql Workflow)',
  trackType: 'C',
  lessonNumber: 0.4,
  isMicroLesson: true,

  explanation: `
At the end of this micro-lesson, you have run your first real (or mock) Dune query inside the sandbox-sql simulator and exported the result as a portfolio artifact.

The sandbox-sql simulator has two modes:

DEMO MODE (always available)
A pre-loaded mock Starknet dataset â€” 90 days of representative transaction, swap, and token_transfer records. Queries run instantly. Used when you are learning query syntax, verifying your approach, or practising without a Dune API key.

REAL MODE (requires Dune API key in Settings)
Live Dune API connection â€” queries run against actual Starknet data. Query time: 10â€“90 seconds depending on data range and complexity. Results include the exact timestamp of when the data was retrieved.

For Lab 9 Build Task and Boss Battle: results from either mode are accepted. Demo mode data produces reproducible, consistent results. Real mode data includes a data-retrieval timestamp in the portfolio artifact.

THE QUERY EXECUTION WORKFLOW

Step 1 â€” Write the query in the editor panel (left side of sandbox-sql).
Draft your SELECT, FROM, WHERE, GROUP BY, ORDER BY per the Primer L2 structure.

Step 2 â€” Run the query (Cmd+Enter or Run button).
Results appear in the table panel (right side). If the query errors: the error message appears below the editor. Common errors:
  â€” "Column not found": field name is wrong â€” check the schema preview (Primer L3)
  â€” "Table not found": table name is misspelled â€” check the Dune schema
  â€” "Syntax error near GROUP": most likely a missing comma in SELECT before GROUP BY

Step 3 â€” Inspect results.
Verify: does the row count look right? Does the first value make sense (is 1 ETH showing as 1, not 1e18)? If all values are suspiciously round, check you divided by the correct decimal factor.

Step 4 â€” Visualise (optional, recommended for Build Task).
The sandbox-sql simulator has a Chart tab. After running a query, switch to Chart to generate a line/bar chart from time-series results. For the Build Task and research writing in L9.4, a chart screenshot strengthens your portfolio artifact.

Step 5 â€” Export.
Click Export â†’ CSV to download the raw results. Click Export â†’ Portfolio Artifact to save the query + results + chart (if generated) as a named artifact associated with your Lab 9 portfolio. Each exported artifact gets a unique ID used in your case-study.md.

QUERY QUALITY CHECKLIST (run before exporting):

[ ] Does the row count match what you expected? (too many rows = missing GROUP BY; too few = overly restrictive WHERE)
[ ] Are numeric values in human-readable units? ($50M, not 50000000000000000000)
[ ] Is the date range correct? (Print MIN(block_time) and MAX(block_time) to verify)
[ ] If comparing two protocols, are you using the same metric definition for both?
[ ] Is the query reproducible? (Could you run it again in 30 days and get comparable results?)

DEMO MODE DATASET â€” WHAT IS AVAILABLE

The mock dataset contains representative records for:
  â€” 90 days (Octâ€“Dec 2024)
  â€” 5 protocols: AVNU, Ekubo, Vesu, Nostra, Extended
  â€” 3 tables: mock_starknet_transactions, mock_avnu_swaps, mock_ekubo_swaps, mock_vesu_positions, mock_token_transfers_strk

Query the mock tables exactly as you would real Dune tables â€” same field names, same SQL syntax. Results will be internally consistent but not match live chain data.
  `.trim(),

  keyTakeaway: `The sandbox-sql workflow â€” write query â†’ run â†’ inspect result plausibility â†’ visualise â†’ export as portfolio artifact â€” produces the original data points required for Lab 9 research output, and the quality checklist (correct units, correct date range, consistent definitions across protocols, reproducible query) is what separates publishable from unpublishable on-chain research.`,

  examples: [
    {
      contextTag: '[First query execution: syntax error recovery]',
      context: 'A learner writes their first AVNU daily volume query and hits a syntax error.',
      scenario: 'Error: "Syntax error near GROUP BY." She checks: her SELECT line is DATE_TRUNC(\'day\', block_time) AS trade_date, SUM(sell_amount)/1e18 AS volume â€” missing the comma between the two SELECT columns. She adds the comma, reruns. Result: 90 rows, one per day, with volume in human-readable ETH.',
      outcome: 'The most common SQL syntax errors are: missing commas between SELECT columns; missing alias after AS; table name with a typo. The error message identifies the location â€” "near GROUP BY" means the error is in the SELECT line, not the GROUP BY itself.',
    },
    {
      contextTag: '[Plausibility check catches a decimal error]',
      context: 'An analyst runs a query returning average AVNU trade size. Result: $2,340,000 average.',
      scenario: 'She pauses: $2.3M average trade size on a chain with $800M TVL is implausible (it would mean fewer than 350 trades ever). She checks: sell_amount was not divided by 1e18 in the AVG(). Correct query: AVG(sell_amount / 1e18). New result: $234 average trade size â€” consistent with a retail-dominated chain.',
      outcome: 'Always check the first numeric value against your intuition about the protocol\'s scale. A single implausible number means the decimal conversion is wrong. Run AVG(amount) and MAX(amount) alongside SUM to detect this quickly.',
    },
    {
      contextTag: '[Export as portfolio artifact]',
      context: 'After building a 7-day AVNU volume trend query, an analyst is ready to include it in her research report.',
      scenario: 'She clicks Export â†’ Portfolio Artifact. The simulator saves: the SQL query text, the result table (90 rows), the line chart, the data-retrieval timestamp (Nov 15 2024 14:32 UTC), and assigns artifact ID PA-L9-001. In her case-study.md she writes: "Source: sandbox-sql PA-L9-001. Retrieved 2024-11-15."',
      outcome: 'Portfolio artifacts link the written research claim to the exact query that produced it. An employer who clicks the verification link sees the query, the result, and the timestamp â€” full reproducibility without requiring them to run Dune themselves.',
    },
  ],

  guidedPractice: [
    {
      question: 'You run a query and get 0 rows. Your WHERE clause includes block_time >= NOW() - INTERVAL \'30 days\'. What is the first thing to check?',
      options: ['A. Increase the LIMIT', 'B. Verify the date range contains data: run SELECT MIN(block_time), MAX(block_time) FROM [table] to confirm the table has records in this window. In demo mode, the dataset covers Octâ€“Dec 2024 â€” queries using NOW() dynamically may miss this range.', 'C. Change ORDER BY', 'D. Switch to a different table'],
      correct: 1,
      explanation: 'B is correct. Zero rows most commonly means the WHERE filter excludes all records. In demo mode, the mock dataset has fixed dates (Octâ€“Dec 2024) â€” queries using NOW() - INTERVAL \'30 days\' look for data near today\'s date, which may be months after the mock dataset ends. Use SELECT MIN(block_time), MAX(block_time) to check the dataset range, then adjust your WHERE clause to use hardcoded dates within that range for demo mode.',
    },
    {
      question: 'Your query returns total Vesu deposits as 8,500,000,000. After Ã· 1e18, you get 0.0000000085. This is clearly wrong. What happened?',
      options: ['A. The data is corrupt', 'B. USDC uses 6 decimals, not 18. You divided by 1e18 instead of 1e6. 8,500,000,000 Ã· 1e6 = 8,500 USDC â€” a plausible deposit amount. Always match the divisor to the specific token\'s decimals.', 'C. Vesu deposits are always tiny', 'D. SUM was wrong â€” use AVG instead'],
      correct: 1,
      explanation: 'B is correct. USDC on Starknet uses 6 decimal places (not 18). 8,500,000,000 Ã· 10^6 = 8,500 USDC â€” approximately $8,500, which is a reasonable deposit size. ETH and STRK use 18 decimals. USDC uses 6. Using the wrong divisor (1e18 for a 6-decimal token) produces a result 10^12 times too small. Check token decimals: USDC=6, ETH=18, STRK=18, WBTC=8.',
    },
    {
      question: 'You want to compare AVNU vs Ekubo 30-day volume in the same query result. Which approach is structurally correct?',
      options: ['A. Run two separate queries and compare manually', 'B. Use UNION ALL to stack both protocol\'s results: SELECT \'AVNU\' AS protocol, SUM(sell_amount)/1e18 AS volume FROM avnu_swaps WHERE ... UNION ALL SELECT \'Ekubo\' AS protocol, SUM(delta_amount)/1e18 AS volume FROM ekubo_swaps WHERE ... ORDER BY volume DESC', 'C. JOIN the two tables on block_time', 'D. Subquery both into a WITH clause and average them'],
      correct: 1,
      explanation: 'B is correct. UNION ALL stacks result rows from multiple SELECT statements into one result set. Each SELECT must return the same number of columns with compatible types. The ORDER BY at the end applies to the combined result. UNION ALL (vs UNION) keeps all rows including duplicates â€” correct here since each protocol\'s row is distinct. JOIN (C) would try to match rows across the two tables row-by-row, which is not meaningful for aggregate volume comparison.',
    },
    {
      question: 'After running a successful query, the Chart tab shows a line chart but the Y-axis values look like scientific notation (e.g., 1.2e+22). What fix is needed?',
      options: ['A. Download as PDF instead', 'B. The Y-axis is showing raw token amounts before decimal conversion. Re-run the query with explicit division by token decimals (e.g., SUM(sell_amount) / 1e18) â€” the chart will display human-readable numbers ($1.2M instead of 1.2e+22).', 'C. Switch to a bar chart', 'D. Add LIMIT 100'],
      correct: 1,
      explanation: 'B is correct. Scientific notation in chart Y-axis values indicates the raw integer token amount is being plotted without decimal conversion. Fix the SELECT clause: SUM(sell_amount) / 1e18 AS volume_eth â€” now the chart plots readable ETH values. This is both a display fix and a data integrity fix â€” portfolio artifacts that show 1.2e+22 on the Y-axis communicate that the analyst did not verify their output.',
    },
    {
      question: 'Which Export option do you use to create a linkable evidence trail for a research report claim?',
      options: ['A. Export â†’ CSV (for sharing with collaborators)', 'B. Export â†’ Portfolio Artifact â€” saves the query text, result data, chart, and data-retrieval timestamp with a unique artifact ID. The artifact ID is used in case-study.md citations and is verifiable at the portfolio verification link.', 'C. Copy the table to clipboard', 'D. Screenshot the result panel'],
      correct: 1,
      explanation: 'B is correct. The Portfolio Artifact export creates a full evidence package: query text (reproducible), result data (verifiable), timestamp (data age), and a unique ID (citeable). A screenshot (D) or CSV (A) cannot be independently verified â€” an employer cannot confirm the query that produced them. Portfolio Artifact is the standard for Lab 9 research output.',
    },
  ],

  lessonSimulations: [
    {
      type: 'sandbox-sql',
      scenario: 'Execute the following four queries in demo mode. For each, run the query, verify the result is plausible, and export as a Portfolio Artifact: (1) Daily AVNU swap count for the past 30 days. (2) Top 10 wallets by total Ekubo volume (30 days). (3) Weekly unique borrowers on Vesu (30 days). (4) STRK inflows to the staking contract by week. Export all four as Portfolio Artifacts PA-L9-001 through PA-L9-004.',
      scoringCriteria: ['Query 1 correct: COUNT(*) per day from mock_avnu_swaps with block_time GROUP BY', 'Query 2 correct: GROUP BY sender, SUM(volume)/1e18, ORDER BY DESC, LIMIT 10 from mock_ekubo_swaps', 'Query 3 correct: COUNT(DISTINCT position_owner) per week from mock_vesu_positions where debt_delta > 0', 'Query 4 correct: SUM(amount)/1e18 per week from mock_token_transfers_strk where to_address = staking_contract', 'All four exported as Portfolio Artifacts with unique IDs'],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'After running the daily AVNU swap count query, you see: most days show 280â€“320 swaps, but one day shows 12. You check block_time: the low-count day is the first day of the mock dataset â€” October 1. What is the most likely explanation and does it affect your 30-day average calculation?',
      scoringCriteria: ['Explanation: partial day data â€” Oct 1 records may only cover part of the day (e.g., starting from 18:00 UTC), producing artificially low count vs a full day\'s activity', 'Impact on 30-day average: yes â€” including a partial first day lowers the average. Correct approach: exclude the first and last day of the query range in averages, or use WHERE block_time > DATE_TRUNC(\'day\', MIN(block_time)) to skip the partial day', 'Notes this is not an anomaly in protocol activity but a data boundary artifact â€” common in any time-windowed dataset'],
    },
    {
      type: 'judgment-communication',
      scenario: 'A Foundation reviewer asks why you used demo mode data in your Lab 9 Build Task instead of real Dune data. Write a two-sentence response that is honest about demo mode limitations while explaining what you would do differently in a production research context.',
      scoringCriteria: ['Honest limitation: demo mode uses a static mock dataset from Octâ€“Dec 2024 â€” the values are internally consistent but do not reflect current chain state, and the figures should not be published as current Starknet metrics', 'Production approach stated: in a production research context, the same queries would be run in real mode via the Dune API, producing results with a data-retrieval timestamp that makes the research claims independently verifiable and time-stamped'],
    },
  ],
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// LAB 9 â€” STRATEGIC ECOSYSTEM ANALYSIS (SENIOR)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// L9.1 â€” On-Chain Data as Competitive Intelligence (SQL + Dune)
// TYPE A/C MIXED â€” Writing queries produces original data unavailable
// in any published report. Four exit-criteria queries taught in full.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const LAB9_LESSON_1 = {
  id: 'l9-1-onchain-competitive-intelligence',
  title: 'On-Chain Data as Competitive Intelligence (SQL + Dune)',
  trackType: 'A',
  lessonNumber: 1,

  explanation: `
In November 2022, a crypto analyst published a thread claiming FTX was solvent. His evidence: FTX's public financial statements and the exchange's self-reported reserves. Three days later, FTX collapsed. The reserves were fabricated, the balance sheet was manipulated, and $8 billion of customer funds were missing. Every piece of evidence he cited was controlled by FTX. None of it was independently verifiable.

On-chain data cannot be fabricated. Every Starknet transaction that has ever occurred is permanently recorded in a public database. No protocol can alter its own transaction history. No PR team can adjust the swap count. No VC can make a daily active user number look better than it is. When you write a SQL query against Dune's Starknet dataset, the answer you get is the answer â€” not the answer anyone wants you to see.

This is what makes on-chain data a competitive intelligence tool rather than a reporting tool. It enables claims of the form: "I measured this myself. Here is the query. Reproduce it yourself. The answer will be the same."

THE FOUR EXIT-CRITERIA QUERIES

By the end of this lesson, you can write these four queries in the sandbox-sql simulator. They are the analytical foundation of every research claim in Lab 9.

QUERY 1 â€” DAILY ACTIVE USERS (DAU) FOR ANY STARKNET PROTOCOL

Question: "How many unique wallets interacted with AVNU each day in the past 30 days?"

  SELECT
    DATE_TRUNC('day', block_time) AS trade_date,
    COUNT(DISTINCT taker_address) AS daily_unique_users
  FROM decoded_starknet.avnu_Exchange_evt_Swap
  WHERE block_time >= NOW() - INTERVAL '30 days'
  GROUP BY trade_date
  ORDER BY trade_date ASC;

Critical distinction: COUNT(DISTINCT taker_address) vs COUNT(*).
COUNT(*) counts swaps. COUNT(DISTINCT taker_address) counts unique wallets.
A power user executing 50 swaps in a day contributes 50 to COUNT(*) but only 1 to COUNT(DISTINCT). DAU means unique users, not swap count.

QUERY 2 â€” 7-DAY VOLUME TREND FOR ANY DEX

Question: "Show AVNU's daily trading volume over the past 7 days."

  SELECT
    DATE_TRUNC('day', block_time) AS trade_date,
    SUM(sell_amount / 1e18) AS daily_volume_eth,
    COUNT(DISTINCT taker_address) AS daily_users,
    SUM(sell_amount / 1e18) / NULLIF(COUNT(DISTINCT taker_address), 0) AS avg_trade_size_eth
  FROM decoded_starknet.avnu_Exchange_evt_Swap
  WHERE block_time >= NOW() - INTERVAL '7 days'
  GROUP BY trade_date
  ORDER BY trade_date ASC;

NULLIF(x, 0) prevents divide-by-zero errors on days with zero users.
avg_trade_size_eth (volume Ã· users) is a proxy for trader sophistication: retail traders average $100â€“500; institutional-style traders average $5,000+.

QUERY 3 â€” UNIQUE USER RANKINGS ACROSS PROTOCOLS

Question: "Which Starknet DeFi protocols have the most unique wallets this month?"

  SELECT
    'AVNU' AS protocol,
    COUNT(DISTINCT taker_address) AS unique_users_30d
  FROM decoded_starknet.avnu_Exchange_evt_Swap
  WHERE block_time >= NOW() - INTERVAL '30 days'

  UNION ALL

  SELECT
    'Ekubo' AS protocol,
    COUNT(DISTINCT sender) AS unique_users_30d
  FROM decoded_starknet.ekubo_Core_evt_Swap
  WHERE block_time >= NOW() - INTERVAL '30 days'

  UNION ALL

  SELECT
    'Vesu' AS protocol,
    COUNT(DISTINCT position_owner) AS unique_users_30d
  FROM decoded_starknet.vesu_Singleton_evt_ModifyPosition
  WHERE block_time >= NOW() - INTERVAL '30 days'

  ORDER BY unique_users_30d DESC;

Note: each protocol uses a different field name for the user wallet address (taker_address, sender, position_owner). Knowing this from the schema (Primer L3) is required before writing. The UNION ALL creates a single ranked table.

QUERY 4 â€” STRK STAKING PARTICIPATION OVER TIME

Question: "How has the amount of STRK staked changed week-over-week in the past 12 weeks?"

  SELECT
    DATE_TRUNC('week', block_time) AS week_start,
    SUM(amount / 1e18) AS weekly_strk_inflow,
    SUM(SUM(amount / 1e18)) OVER (ORDER BY DATE_TRUNC('week', block_time)) AS cumulative_strk_staked
  FROM starknet.token_transfers
  WHERE contract_address = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d'  -- STRK token
    AND to_address = '0x[staking_contract_address]'
    AND block_time >= NOW() - INTERVAL '12 weeks'
  GROUP BY week_start
  ORDER BY week_start ASC;

SUM(SUM(...)) OVER (ORDER BY ...) is a window function â€” it produces a running total. Weekly inflow shows new staking. Cumulative total shows growth trajectory.

CONVERTING QUERIES INTO INTELLIGENCE

A query result is data. Intelligence requires interpretation. The standard output format:
1. The claim: one sentence stating what the data shows.
2. The evidence: the query result (specific numbers).
3. The implication: what this means for the ecosystem.
4. The limitation: what the data does not tell you.

Example for Query 1 result (DAU query returns: average 285 daily unique users, peak 512):
Claim: AVNU averages 285 daily unique users with a recent peak of 512.
Evidence: sandbox-sql PA-L9-001 (query on decoded_starknet.avnu_Exchange_evt_Swap, 30-day window).
Implication: at Arbitrum's DAU/TVL ratio (28,000 DAU at $4B TVL), Starknet would need ~1,600 DAU to be proportional. At 285, AVNU's user base is 5Ã— below the proportional Arbitrum benchmark.
Limitation: this query does not capture users who access AVNU through aggregator interfaces â€” some users may trade through AVNU's liquidity without the tx going through the Exchange contract directly.
  `.trim(),

  keyTakeaway: `On-chain SQL queries produce original, independently verifiable intelligence unavailable in any published report â€” the four exit-criteria queries (DAU, volume trend, cross-protocol user ranking, staking participation) form the analytical foundation of Senior-level research, and converting query results into publishable intelligence requires: one claim, one evidence citation, one implication, and one limitation.`,

  examples: [
    {
      contextTag: '[FTX contrast: on-chain vs self-reported data]',
      context: 'An analyst reviews two Starknet protocols â€” one provides a public dashboard, the other\'s data must be queried directly from Dune.',
      scenario: 'The public dashboard shows 15,000 MAU. The analyst queries decoded_starknet.avnu_Exchange_evt_Swap directly: COUNT(DISTINCT taker_address) over the same 30-day window returns 9,200. The 5,800-user gap is explained by: (1) the dashboard counts app visits (browser sessions), not blockchain interactions, and (2) wallets that connected but did not execute a swap are counted by the dashboard but not by the on-chain query.',
      outcome: '"On-chain MAU is the correct metric for a DeFi protocol. 9,200 wallets executed at least one swap â€” they showed up on-chain, which requires real intent and real tokens. 15,000 dashboard visits includes curiosity browsing. Research reports should cite the on-chain figure with the query reference."',
    },
    {
      contextTag: '[Cross-protocol user ranking catches a gap]',
      context: 'An analyst runs the four-protocol UNION ALL user ranking query for a competitive landscape section.',
      scenario: 'Results: AVNU 9,200 unique users. Ekubo 6,800. Vesu 1,450. Nostra 980. She adds a 30-day earlier comparison period and finds: all protocols showed growth, but Vesu grew 42% in users while AVNU grew 8%. This relative growth rate was not visible in any published report â€” DefiLlama shows TVL, not user growth.',
      outcome: '"Vesu\'s 42% user growth vs AVNU\'s 8% is the first on-chain signal I\'ve seen that suggests lending is gaining faster than DEX activity on Starknet â€” a potential inflection in ecosystem development phase." This insight was only available through the cross-protocol query run across two time windows.',
    },
    {
      contextTag: '[Staking participation window function in practice]',
      context: 'A researcher uses Query 4 to write the "network health" section of a Starknet ecosystem report.',
      scenario: 'Window function result: week 1: 8.2M STRK cumulative; week 12: 31.4M STRK cumulative. Weekly inflows ranged from 1.2M to 4.8M STRK. She notes: "31.4M STRK represents 3.1% of the 1B STRK total supply. At current prices ($0.40/STRK), staked value is $12.6M." She cites: sandbox-sql PA-L9-004, retrieved 2024-11-15.',
      outcome: '"Staking participation at 3.1% of supply is below Ethereum\'s ~26% staking rate â€” but Starknet staking launched only 8 months ago. The weekly inflow trend shows acceleration (week 1: 1.2M STRK, week 12: 4.8M STRK) suggesting an upward trajectory."',
    },
  ],

  guidedPractice: [
    {
      question: 'Why does the DAU query use COUNT(DISTINCT taker_address) rather than COUNT(*)?',
      options: ['A. COUNT(*) is slower', 'B. One wallet executing 10 swaps in a day contributes 10 to COUNT(*) but 1 to COUNT(DISTINCT taker_address). DAU measures unique users â€” 10 swaps by 1 wallet is 1 daily active user, not 10.', 'C. COUNT(*) counts columns, not rows', 'D. DISTINCT is required by Dune\'s query engine'],
      correct: 1,
      explanation: 'B is correct. COUNT(*) counts every row â€” including multiple swaps by the same wallet on the same day. COUNT(DISTINCT taker_address) deduplicates within each group: if wallet 0xABC executes 10 swaps on Monday, it contributes 1 to Monday\'s DAU. This distinction is critical â€” a protocol with 50 total users each trading 20 times per day might look like 1,000 DAU from COUNT(*) but is correctly 50 DAU from COUNT(DISTINCT).',
    },
    {
      question: 'NULLIF(COUNT(DISTINCT taker_address), 0) appears in the volume trend query as a denominator. Why is this pattern used?',
      options: ['A. To handle NULL values in taker_address', 'B. On days with zero unique users, COUNT(DISTINCT) returns 0. Without NULLIF, dividing by 0 produces a SQL error that stops the entire query. NULLIF(x, 0) returns NULL instead of 0, and dividing by NULL produces NULL instead of an error â€” allowing the query to complete with a NULL for days with no activity.', 'C. NULLIF makes the count faster', 'D. Required by Dune for all division operations'],
      correct: 1,
      explanation: 'B is correct. SQL division by zero is a runtime error, not just a bad value. NULLIF(expression, 0) returns NULL when the expression equals zero â€” NULL Ã· anything = NULL, not an error. The result is that days with zero users show NULL for avg_trade_size instead of crashing the query. This is standard defensive SQL for any calculated ratio with a potentially zero denominator.',
    },
    {
      question: 'The cross-protocol UNION ALL query requires different field names for "user wallet address" across three protocols (taker_address for AVNU, sender for Ekubo, position_owner for Vesu). What happens if you use taker_address for all three?',
      options: ['A. The query works â€” field names don\'t matter', 'B. The Ekubo and Vesu SELECT statements error with "Column not found: taker_address" â€” those tables do not have that field name. Each protocol\'s decoded event uses the field name from the original contract event definition, which varies by protocol.', 'C. All three will return zero results', 'D. Results are averaged across all three fields'],
      correct: 1,
      explanation: 'B is correct. Dune decoded tables use the field names from the original smart contract events. AVNU emits a Swap event with a taker field â†’ decoded as taker_address. Ekubo emits with a caller field â†’ decoded as sender. Vesu emits with a position_owner field. Using taker_address in the Ekubo SELECT fails because the ekubo_Core_evt_Swap table does not have that column. Schema fluency (Primer L3) is required before writing UNION ALL across protocols.',
    },
    {
      question: 'Query 4 uses a window function: SUM(SUM(amount/1e18)) OVER (ORDER BY week_start). What does the inner SUM vs outer SUM do?',
      options: ['A. Both SUMs calculate the same thing', 'B. Inner SUM: SUM(amount/1e18) is the GROUP BY aggregate â€” total STRK inflow for each week. Outer SUM OVER: a window function that takes the per-week totals and accumulates them in order. Week 1: 1.2M. Week 2: 1.2M + 2.1M = 3.3M cumulative. Week 3: 3.3M + 1.8M = 5.1M cumulative. The outer SUM OVER creates a running total without additional GROUP BY.', 'C. The inner SUM sums rows; the outer SUM sums columns', 'D. Window functions cannot be nested inside aggregate functions'],
      correct: 1,
      explanation: 'B is correct. The inner SUM(amount/1e18) aggregates rows within each GROUP BY week into one total per week. The outer SUM(...) OVER (ORDER BY week_start) then accumulates those weekly totals sequentially: week N\'s cumulative value = sum of all weekly totals from week 1 through week N. This is the standard pattern for running totals in SQL.',
    },
    {
      question: 'Your DAU query returns average 285 DAU for AVNU. Arbitrum\'s equivalent DEX (with 100Ã— Starknet\'s TVL) has 28,000 DAU. At Arbitrum\'s DAU/TVL ratio, what DAU would proportional Starknet have? What is the most likely driver of the gap?',
      options: ['A. 2,800 DAU proportional. Gap driver: Starknet has lower TVL', 'B. 280 DAU proportional â€” Starknet is actually overperforming. Gap driver: Starknet users are more active per dollar of TVL', 'C. 2,800 DAU proportional (28,000 Ã· 100Ã— TVL ratio). Current 285 DAU means Starknet has roughly 10% of proportional DAU. Most likely driver: user acquisition gap â€” Starknet has less brand recognition, fewer entry points, and a smaller existing user base even given its TVL, not a protocol quality problem.', 'D. Cannot compare across chains'],
      correct: 2,
      explanation: 'C is correct. If Arbitrum has 100Ã— Starknet\'s TVL and 28,000 DAU, proportional Starknet DAU = 28,000 Ã· 100 = 280. Current 285 is essentially proportional â€” Starknet\'s DAU matches its TVL share of Arbitrum. This means the protocols work as efficiently as Arbitrum\'s; the gap is user acquisition (getting more people to Starknet), not protocol performance. This framing â€” "Starknet needs users, not redesigned protocols" â€” matches the Labs 3 and 7 finding.',
    },
  ],

  lessonSimulations: [
    {
      type: 'sandbox-sql',
      scenario: 'Write and run all four exit-criteria queries in the sandbox-sql simulator using the mock dataset. For each query: (1) verify the result is plausible, (2) export as a Portfolio Artifact (PA-L9-001 through PA-L9-004). After running all four, write a one-sentence intelligence claim from the most interesting result, including the artifact ID as the evidence citation.',
      scoringCriteria: ['All four queries syntactically correct and producing non-zero results in demo mode', 'Query 1 (DAU): COUNT(DISTINCT taker) per day, GROUP BY DATE_TRUNC(\'day\'), result ~200-400 users/day range in mock data', 'Query 2 (Volume trend): SUM(sell_amount)/1e18, NULLIF denominator present for avg_trade_size', 'Query 3 (Ranking): UNION ALL across 3+ protocols with correct field names for each, ORDER BY DESC', 'Query 4 (Staking): Window function SUM OVER correct, token contract address in WHERE', 'One intelligence claim written: one sentence with specific number + artifact ID citation'],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Cross-protocol user ranking query returns: AVNU 9,200 unique users, Ekubo 6,800, Vesu 1,450, Nostra 980. You run the same query for the prior 30-day period and get: AVNU 8,500, Ekubo 6,600, Vesu 1,030, Nostra 840. Calculate month-over-month growth for each protocol. Which two growth rates are most analytically significant, and what research questions do they raise?',
      scoringCriteria: ['Growth rates: AVNU +8.2%, Ekubo +3.0%, Vesu +40.8%, Nostra +16.7%', 'Most significant: Vesu\'s 40.8% growth is the standout â€” 4-5Ã— higher than the DEX protocols. This raises the question: is Starknet transitioning from a DEX-dominated ecosystem to a more mature multi-product DeFi ecosystem, with lending beginning to catch up?', 'Second significant: Nostra\'s 16.7% growth vs Ekubo\'s 3.0% suggests lending protocols are growing faster than established DEXs â€” supporting the Vesu finding as a category trend, not a protocol-specific anomaly', 'Research questions generated: (a) Is this a DeFi maturation cycle (DEX first, then lending), (b) Is Vesu running a specific incentive program, (c) Is lending growth correlated with STRK staking growth (Lab 9 Query 4)?'],
    },
    {
      type: 'judgment-communication',
      scenario: 'Convert the cross-protocol user ranking query result into a publishable intelligence claim using the standard format: Claim â†’ Evidence â†’ Implication â†’ Limitation. The data: AVNU 9,200 DAU, Ekubo 6,800, Vesu 1,450. Vesu grew 41% month-over-month. Your audience is a VC fund evaluating Starknet DeFi.',
      scoringCriteria: ['Claim: specific and one sentence â€” e.g., "Starknet\'s lending protocols grew users 41% month-over-month vs 8% for DEXs, suggesting a potential ecosystem maturation shift."', 'Evidence: artifact ID cited (e.g., PA-L9-003), query description included ("UNION ALL across 3 protocol decoded event tables, 30-day window")', 'Implication: states what this means for investment â€” e.g., lending protocols may be undervalued relative to DEXs if growth differential persists; Vesu and Nostra are the leading signals', 'Limitation: accurately states what the data does not show â€” e.g., whether user growth is incentive-driven (temporary) or organic (sustainable) requires correlating with token incentive program dates'],
    },
  ],
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// L9.2 â€” Systemic Risk Mapping
// TYPE A â€” Dependency graphs and contagion chains: how a single
// protocol failure propagates to terminal ecosystem damage.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const LAB9_LESSON_2 = {
  id: 'l9-2-systemic-risk-mapping',
  title: 'Systemic Risk Mapping',
  trackType: 'A',
  lessonNumber: 2,

  explanation: `
On November 19, 2022, the lending protocol Solend on Solana faced a crisis. One single wallet held $170 million in USDC collateral and had borrowed $108 million in SOL against it. SOL's price was falling. If the position hit its liquidation threshold, Solend's liquidation bot would need to sell $21 million of SOL in seconds â€” into a thin market. The liquidity did not exist to absorb a $21M SOL dump without catastrophic price impact. A single liquidation would crash SOL's price further, triggering more liquidations, which would crash prices further. The entire Solana DeFi ecosystem faced a sequential collapse from a single over-leveraged position in a single protocol.

Solend's team proposed taking emergency control of the wallet. The community voted on a governance proposal in 30 minutes â€” a speed that exposed a governance risk in addition to the systemic risk. The story did not collapse into a death spiral, but only barely.

The Solend incident illustrates the core concept of systemic risk mapping: ecosystems have dependency structures where a failure in one component does not stay contained â€” it propagates through the connections between protocols in a predictable sequence that can be traced in advance.

THE DEPENDENCY GRAPH METHODOLOGY

Start with the protocol you are analysing. List every external protocol it depends on. For each dependency, ask three questions:

1. What happens to your protocol if this dependency fails? (Operational impact)
2. Is the impact recoverable or terminal? (Recovery characterisation)
3. Does this dependency have its own dependencies your protocol is also exposed to? (Second-order exposure)

A dependency graph is the visual output: your protocol in the centre, dependencies radiating outward, with severity labels on each connection.

CONTAGION CHAIN ANALYSIS: THE EKUBO FAILURE SCENARIO

Ekubo provides approximately 92% of Starknet's DEX liquidity (Lab 7). This concentration creates the most critical single-point-of-failure on Starknet. Trace the contagion chain if Ekubo fails (exploit, governance attack, or protocol pause):

Step 1 â€” Immediate impact: Ekubo offline â†’ 92% of Starknet DEX liquidity disappears.

Step 2 â€” AVNU degraded: AVNU aggregates routes from Ekubo, JEDI, and minor DEXs. 92% of routing options vanish â†’ AVNU quote quality degrades by ~80% â†’ users face 3â€“5Ã— wider bid/ask spreads. At spreads above 2%, most DeFi trades become economically unviable.

Step 3 â€” Price discovery broken: Without adequate DEX liquidity, STRK's on-chain price diverges from its true market value. Pragma oracle reads the STRK/USDC price from on-chain DEX activity â€” when that activity is distorted by insufficient liquidity, Pragma reports a stale or incorrect STRK price.

Step 4 â€” Lending protocols compromised: Vesu and Nostra use Pragma to value STRK collateral. If Pragma reports STRK price incorrectly: (a) under-collateralised positions are not identified â†’ bad debt accumulates silently; (b) over-collateralised positions may be wrongly liquidated â†’ users lose collateral they should retain.

Step 5 â€” Liquidation cascade: When Pragma eventually restores or a new price update arrives at the correct level, protocols simultaneously process all the liquidations that should have happened during the distortion. These liquidated positions are sold into the now-already-thin post-Ekubo market â†’ additional price pressure â†’ additional liquidations.

Step 6 â€” Terminal state: Vesu and Nostra may hold bad debt they cannot recover from market sales at distorted prices. Combined Starknet DeFi TVL could fall 40â€“70% within 72 hours of an Ekubo failure, with months of recovery time.

Impact characterisation: terminal for the DeFi ecosystem in its current state. Recovery requires: (a) Ekubo restoration, (b) oracle integrity verification, (c) bad debt socialisation, (d) confidence rebuild (weeks to months).

SYSTEMIC RISK TAXONOMY

Beyond Ekubo, Starknet has four categories of systemic risk:

1. CONCENTRATION RISK
Definition: one entity controls a disproportionate share of a critical function.
Starknet examples: Ekubo (92% DEX liquidity), StarkWare (centralised sequencer + prover), Pragma (primary oracle for all lending protocols).
Measurement: SQL query â€” SELECT to_address, COUNT(*) as tx_count FROM starknet.transactions GROUP BY to_address ORDER BY tx_count DESC LIMIT 20 â€” shows which contracts receive the highest transaction share.

2. DEPENDENCY RISK
Definition: your protocol cannot function if an external protocol fails, regardless of your own code correctness.
Starknet examples: AVNU depends on Ekubo for routing. Vesu depends on Pragma for prices. Extended depends on Pragma for mark price calculation.
Measurement: read each protocol's documentation to identify external calls; cross-reference with Lab 9 L1 protocol usage queries.

3. LIQUIDITY RISK
Definition: insufficient market depth to execute liquidations or large trades without significant price impact.
Starknet examples: all lending protocols face this if the $8â€“20M OI on Extended creates a forced deleveraging, or if a large STRK collateral position needs liquidating.
Measurement: compare protocol's largest single position size to 24-hour DEX volume â€” if position > 5% of daily volume, liquidation creates significant market impact.

4. GOVERNANCE RISK
Definition: protocol upgrade or emergency controls concentrate power in a small group that may act against user interests.
Starknet examples: StarkWare can upgrade core protocol contracts with a timelock but without community vote. Ekubo has a 2-of-3 multisig emergency pause. Vesu pool parameters can be changed by the pool deployer.
Measurement: check each protocol's governance documentation for emergency control holders and timelock durations.

SQL EVIDENCE FOR SYSTEMIC RISK

One specific query illustrates oracle concentration risk â€” the most critical systemic exposure in Starknet's DeFi stack:

  SELECT
    protocol_name,
    oracle_address,
    COUNT(*) AS oracle_calls_30d
  FROM decoded_starknet.pragma_OracleInterface_evt_PriceFeedUpdate AS oracle
  JOIN protocol_contracts ON oracle.consumer_address = protocol_contracts.contract_address
  GROUP BY protocol_name, oracle_address
  ORDER BY oracle_calls_30d DESC;

If results show that AVNU, Vesu, Nostra, and Extended all call the same Pragma oracle address, you have confirmed: a single oracle failure affects all four protocols simultaneously â€” oracle concentration risk is verified by on-chain evidence, not just documentation review.
  `.trim(),

  keyTakeaway: `Systemic risk mapping requires tracing dependency graphs from the protocol under analysis outward â€” Starknet's critical contagion chain runs from Ekubo failure through AVNU degradation to Pragma price distortion to lending protocol bad debt accumulation, a terminal cascade that is preventable only by sequencer decentralisation and DEX liquidity diversification, and SQL queries can verify concentration risk directly from on-chain oracle call patterns.`,

  examples: [
    {
      contextTag: '[Solend single-position systemic risk in practice]',
      context: 'An analyst assessing Vesu for a research report notices one wallet holds $3.2M of STRK collateral with $2.1M of USDC borrowed â€” the single largest position at 65.6% LTV.',
      scenario: 'She runs a query: SELECT position_owner, collateral_asset, collateral_delta, debt_delta FROM decoded_starknet.vesu_Singleton_evt_ModifyPosition to reconstruct current positions. The $3.2M position represents 18% of Vesu\'s total STRK collateral. At Vesu\'s 75% LTV liquidation threshold, STRK needs to fall 14% from its current price before this position liquidates. 14% is a routine daily move for STRK in volatile conditions.',
      outcome: '"Vesu has a single-position concentration risk: one wallet\'s $3.2M STRK position represents 18% of total STRK collateral and faces liquidation within normal daily volatility. A forced sale of $3.2M of STRK into Starknet\'s ~$36M daily DEX volume (approximately 9% of daily volume) would create significant price impact â€” a self-reinforcing liquidation spiral."',
    },
    {
      contextTag: '[Oracle concentration confirmed by SQL]',
      context: 'Three Starknet lending protocols all list STRK as collateral. An analyst wants to confirm they all use the same oracle before making a systemic risk claim.',
      scenario: 'She queries Pragma oracle call events. Results: Vesu calls Pragma\'s primary ETH/USD and STRK/USD feeds 847 times per day. Nostra calls the same feed addresses 634 times per day. Extended uses the same STRK/USD address for mark-to-market. All three confirmed to read from a single Pragma feed address: 0xC001B00K. One oracle failure = simultaneous price distortion for all three protocols.',
      outcome: '"Oracle concentration confirmed on-chain: Vesu, Nostra, and Extended all read STRK/USD price from Pragma feed 0xC001B00K (847+634+protocol calls per day). A 10-minute Pragma outage creates simultaneous price distortion for 3 protocols representing 85% of Starknet\'s lending TVL."',
    },
    {
      contextTag: '[Sequencer outage historical analog]',
      context: 'An analyst includes a sequencer centralisation risk section in a Starknet ecosystem report for a protocol considering deployment.',
      scenario: 'She cites: "On March 3, 2023, Arbitrum\'s centralised sequencer went offline for 78 minutes. All Arbitrum transactions froze. No liquidations could occur. No trades could execute. No withdrawals were possible. User funds were not lost â€” but they were inaccessible. Starknet\'s sequencer is currently centralised under StarkWare. A sequencer outage creates identical exposure: all Starknet DeFi freezes simultaneously, regardless of individual protocol quality."',
      outcome: '"The Arbitrum precedent directly applies to Starknet. We rate sequencer centralisation as the highest single systemic risk â€” not because it is the most likely failure, but because its impact (all DeFi frozen) is the most certain consequence of a relatively plausible event (infrastructure downtime)."',
    },
  ],

  guidedPractice: [
    {
      question: 'The contagion chain analysis shows that Ekubo failure leads to Pragma price distortion. What is the precise mechanism connecting these two?',
      options: ['A. Ekubo and Pragma use the same smart contract', 'B. Pragma calculates on-chain STRK price from DEX trading activity â€” specifically from the price of the most recent trades in liquid STRK pools. When Ekubo (92% of DEX liquidity) goes offline, the remaining 8% of DEX liquidity is insufficient to produce a representative STRK price. Pragma then reads distorted prices from thin liquidity.', 'C. Ekubo owns Pragma', 'D. Pragma is owned by StarkWare'],
      correct: 1,
      explanation: 'B is correct. Pragma is an oracle â€” it derives on-chain asset prices from DEX activity. If the DEX liquidity it reads from (Ekubo) disappears, the price it reports is derived from a thin, easily-manipulated 8% of normal liquidity. This is not a direct Ekuboâ†’Pragma dependency in code â€” it is a market structure dependency: the oracle\'s accuracy depends on the depth of the market it observes.',
    },
    {
      question: 'A Starknet protocol calls five different external protocols in its execution flow. Applying the three-question dependency framework, which question has the most asymmetric impact?',
      options: ['A. Question 1 â€” operational impact (always most important)', 'B. Question 2 â€” recovery characterisation (recoverable vs terminal). A dependency that is recoverable (protocol temporarily paused, quickly restored) is operationally different from a terminal dependency (protocol permanently exploited, funds lost). A terminal dependency failure propagates permanent damage; a recoverable one propagates temporary disruption. Distinguishing these determines how much weight to give each dependency in the risk assessment.', 'C. Question 3 â€” second-order exposure (always most complex)', 'D. All three questions have equal weight'],
      correct: 1,
      explanation: 'B is correct. The recovery characterisation question has the most asymmetric consequence. An operational impact (Question 1) tells you what breaks â€” important but descriptive. The recovery question tells you how bad it is: temporary disruption vs permanent loss changes the risk rating from "tolerable" to "existential." Answering Question 2 first allows you to immediately triage which dependencies warrant deep analysis (terminal) vs which are minor concerns (recoverable).',
    },
    {
      question: 'Why is governance risk in the dependency taxonomy a systemic risk, not just a project risk for the protocol with the governance vulnerability?',
      options: ['A. It is only a project risk', 'B. A governance attack on a protocol with system-wide dependencies propagates beyond that protocol. Example: if Ekubo\'s 2-of-3 multisig emergency pause is compromised and Ekubo is paused maliciously, the systemic effects (DEX liquidity removal, oracle distortion, lending cascade) affect the entire ecosystem â€” not just Ekubo\'s own users. Governance vulnerabilities in critical dependency nodes become systemic vectors.', 'C. Governance only affects token holders', 'D. Governance risk is regulatory, not technical'],
      correct: 1,
      explanation: 'B is correct. Governance risk becomes systemic when the protocol with the vulnerability is a critical dependency for other protocols. Ekubo\'s 2-of-3 pause multisig is a governance risk for Ekubo users â€” but because 6+ protocols depend on Ekubo for liquidity, a successful governance attack on Ekubo propagates into those protocols\' operations. The systemic nature of the risk is determined by the protocol\'s position in the dependency graph, not just its own governance quality.',
    },
    {
      question: 'Starknet has a $36M average daily DEX volume. Vesu\'s largest single collateral position is $3.2M of STRK. If this position is forcibly liquidated, what is the market impact ratio and what does it imply?',
      options: ['A. 8.9% of daily volume (3.2M Ã· 36M). Liquidating 8.9% of daily volume in a short window creates significant price slippage â€” likely 5â€“15% downward price impact. This price impact triggers additional liquidations, creating a self-reinforcing cascade.', 'B. 0.09% â€” negligible impact', 'C. 100% â€” all daily volume is used', 'D. Market impact cannot be calculated without knowing the STRK price'],
      correct: 0,
      explanation: 'A is correct. $3.2M Ã· $36M = 8.9% of daily volume. Academic research on market impact shows that a single forced sale of 5â€“10% of daily volume causes 3â€“8% price slippage in typical conditions. In a stressed market (which a Vesu liquidation event would be), slippage compounds. The implication: liquidating the largest Vesu position in a single transaction would itself move the STRK price enough to potentially trigger the next-largest position\'s liquidation threshold, creating a cascade.',
    },
    {
      question: 'A SQL query confirms that AVNU, Vesu, and Extended all call the same Pragma oracle address 0xC001. A Pragma team member posts on X that they are upgrading the oracle contract. What systemic risk event does this create, and what should protocols do?',
      options: ['A. No risk â€” oracle upgrades are routine', 'B. Oracle contract address change risk: if Pragma deploys to a NEW contract address and protocols are not updated simultaneously, protocols still calling the OLD address receive stale prices from a deprecated oracle. If the upgrade takes 30 minutes and 3 protocols are still pointing at the old address: Vesu, AVNU, and Extended operate on stale prices for 30 minutes â€” any liquidations triggered during this window may use incorrect pricing.', 'C. Protocols should immediately pause', 'D. Only Vesu is affected since it uses collateral'],
      correct: 1,
      explanation: 'B is correct. This is a real coordination risk during oracle upgrades. Protocols must coordinate the transition: all protocols update their oracle address pointer simultaneously (or very close in time) with the Pragma deployment. During any transition window, protocols may operate on different price versions. The recommended approach: Pragma announces upgrade with a minimum 48-hour notice period, all dependent protocols coordinate the address update on a block-timed schedule, and protocols implement a staleness check that pauses activity if the oracle has not updated within N blocks.',
    },
  ],

  lessonSimulations: [
    {
      type: 'sandbox-sql',
      scenario: 'Using the mock dataset, write a query to identify oracle concentration risk. Find all contracts that have interacted with the mock Pragma oracle address (0xPRAGMA_MOCK) in the past 30 days â€” these are the protocols dependent on Pragma. Return: calling_contract, protocol_name (use a CASE WHEN to map known contract addresses), call_count. Order by call_count DESC.',
      scoringCriteria: ['Queries mock_starknet_transactions WHERE to_address = \'0xPRAGMA_MOCK\' OR equivalent oracle call pattern', 'CASE WHEN mapping of contract addresses to protocol names (AVNU, Vesu, Nostra, Extended minimum)', 'GROUP BY calling_contract with COUNT(*) AS call_count', 'ORDER BY call_count DESC', 'Result correctly identifies 3-5 protocols all calling the same oracle â€” confirming concentration risk claim from the lesson'],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'Pragma experiences a 10-minute outage during which ETH drops 12%. Map the full contagion chain step-by-step for Starknet DeFi during those 10 minutes and the 30 minutes after Pragma restores. Identify: (a) which positions are at risk during the outage, (b) what prevents those liquidations from executing, (c) what happens when Pragma restores, (d) whether the recovery is terminal or manageable with existing architecture.',
      scoringCriteria: ['During outage: ETH-collateralised borrowers at 75-80% LTV (healthy factors between 1.0-1.1) now have true health factors below 1.0 at 12% lower ETH price. BUT protocols cannot calculate this because Pragma is not updating â€” no health factor update, no liquidation trigger', 'Liquidation prevention mechanism: lending protocol health factor calculation reads from Pragma oracle feed. Stale feed = stale health factors = liquidation bots cannot identify at-risk positions', 'Post-restoration cascade: Pragma updates to correct lower ETH price. All protocols simultaneously recalculate health factors. Multiple positions now at health factor < 1.0 simultaneously. Liquidation bots compete to liquidate first. Multiple large ETH collateral positions selling simultaneously into already-stressed ETH market', 'Recovery characterisation: manageable if total at-risk positions are small relative to DEX liquidity depth. Terminal if multiple large positions (>5% daily DEX volume each) liquidate simultaneously. At current Starknet scale ($120M lending TVL), most scenarios are manageable â€” but edge cases at higher leverage / larger positions could trigger self-reinforcing cascade'],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Three data points from your queries: (1) Ekubo receives 68% of all Starknet transactions by contract. (2) 4 out of 5 major Starknet DeFi protocols have at least one Ekubo function call in their code. (3) Pragma\'s single ETH/USD feed is called by 6 protocols. You are writing the systemic risk section of a Senior research report. Which single risk factor should be ranked highest and why?',
      scoringCriteria: ['Correctly ranks oracle concentration (Pragma single feed, 6 protocols) as highest risk â€” over Ekubo concentration â€” with correct reasoning: oracle failure creates incorrect price data which enables incorrect protocol state (silent bad debt accumulation) whereas Ekubo failure creates visible operational disruption (users cannot trade) that protocols can respond to', 'Ekubo concentration correctly ranked second: high impact but visible and recoverable once Ekubo restores. Protocols pause, oracle prices stabilise, normal operation resumes', 'Distinguishes silent risk (oracle) from visible risk (DEX liquidity) as the key criterion for priority ranking'],
    },
  ],
};
