# ASSUMPTIONS.md
**Digital Alpha Technology - Financial Transactions & Rewards Dashboard**

This document details the product and data assumptions made while implementing the core application, specifically addressing ambiguous areas in the assignment brief and anomalies discovered during in-depth analysis of `transactions.json`.

---

## 1. Reward Coin Calculation & Ledger Rules
- **Earning Formula**: 
  - Earn **1 Coin per ₹100 spent** on transactions with status `SUCCESS`.
  - Formula: `floor(amount / 100)`.
  - **Transaction Cap**: Capped at a maximum of **100 coins per transaction** (e.g., a ₹50,000 transaction earns 100 coins rather than 500 coins, preventing runaway balance inflation).
- **Eligibility**:
  - `FAILED` and `PENDING` transactions earn **0 coins**.
  - Negative amounts (refunds / reversals) earn **0 coins** and are excluded from positive spend reward accumulation.
- **Initial User Balance**:
  - The user's total earned coins are dynamically aggregated across all historical `SUCCESS` transactions in the seed dataset (~72,000+ eligible coins).
  - The available coin balance reflects `Total Earned Coins - Total Redeemed Coins` in the redemption ledger.

---

## 2. Real-World Data Anomaly Resolutions in `transactions.json`

During data exploration of all 10,000 raw JSON objects, several real-world data traps were detected. The following assumptions were implemented:

| Anomaly Discovered | Occurrence in Dataset | Product Assumption & Handling |
| :--- | :--- | :--- |
| **5 Heterogeneous Timestamp Formats** | • ISO 8601 UTC (`2025-10-03T21:03:27Z`): 5,476 rows<br/>• ISO with offset (`+05:30`): 1,961 rows<br/>• Unix Milliseconds (`1768265109000`): 1,007 rows<br/>• Slash format (`11/04/2026 13:58:03`): 841 rows<br/>• Date only (`2025-07-03`): 715 rows | **Assumption**: All timestamps represent valid transaction moments in time. The ingestion pipeline normalizes all 5 patterns into standard UTC `TIMESTAMPTZ` with timezone awareness. |
| **Duplicate Transaction IDs** | 40 instances sharing ID strings (e.g., `TXN2025000336` assigned to both *ACT Fibernet* ₹3,133.69 and *McDonald's* ₹655.81) | **Assumption**: These represent separate, valid transactions where upstream ID generation collided. A unique surrogate `UUID` primary key is generated for every row, preserving the original string as `raw_id`. |
| **Status Casing Inconsistency** | 25 records with lowercase `'success'` vs 8,775 with uppercase `'SUCCESS'` | **Assumption**: Status is an enum (`SUCCESS`, `FAILED`, `PENDING`). The ETL pipeline normalizes all values to uppercase. |
| **Missing / Empty Categories** | 150 `null` categories and 50 empty string `""` categories | **Assumption**: Every merchant in the dataset has a 100% deterministic 1-to-1 relationship with its category (e.g., *Amazon* &rarr; *Shopping*, *Swiggy* &rarr; *Food & Dining*, *BPCL* &rarr; *Fuel*). The ingestion engine imputes missing categories using this deterministic map, with `'General'` fallback. |
| **String Amount Types** | 20 records with amount as string (e.g., `"5065.00"`) | **Assumption**: Upstream string serialization artifact. Stripped of commas/currency symbols and cast to numeric `DECIMAL(12, 2)`. |
| **Negative Amounts (Reversals & Refunds)** | 148 transactions with negative amounts (e.g., `-₹53,652.71`) | **Assumption**: These represent charge reversals / refunds. Stored with `is_refund = True`, displayed with rose highlight in UI, and excluded from positive gross spend breakdowns. |
| **Extreme Outliers** | Single test row with `₹999,999,999.0` | **Assumption**: Retained in database for historical fidelity, with coin earnings safely bounded by the per-transaction cap. |

---

## 3. Rewards Catalogue Design
- A curated 6-item rewards catalogue was defined spanning common consumer lifestyle categories:
  1. **Amazon Shopping Voucher** (500 coins &rarr; ₹500 E-Voucher)
  2. **Swiggy Gourmet Feast** (250 coins &rarr; ₹250 Food Credit)
  3. **MakeMyTrip Flight Cashback** (1,000 coins &rarr; ₹1,000 Flight Pass)
  4. **Spotify Premium (3 Months)** (350 coins &rarr; 3 Months Free)
  5. **BPCL Fuel Cash Card** (150 coins &rarr; ₹150 Fuel Topup)
  6. **Apple Store Gift Card** (2,000 coins &rarr; ₹2,000 Store Card)
- **Voucher Generation**: Every successful redemption generates a unique, human-readable voucher code (e.g., `AMZN-8K9P-4X2W`).
- **Inventory / Stock**: Each reward has an initial stock quantity that is decremented atomically on checkout.

---

## 4. Cross-Filtering Assumptions
- **One-Way vs Two-Way Filtering**:
  - **Category Donut Chart &rarr; Table**: Clicking any slice sets `category = SelectedCategory`, immediately filtering table results and updating statistics.
  - **Monthly Trend Chart &rarr; Table**: Clicking any monthly bar sets the `startDate` and `endDate` range for that specific month.
  - **Table Filters &rarr; Charts**: The Monthly Trend chart reflects category filters passed to it, enabling smooth bidirectional visual slicing.
