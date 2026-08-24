# AI-USAGE.md
**Digital Alpha Technology - AI Tools Usage Disclosure**

This document provides full transparency on how AI tools were utilized during the development of this take-home project, including tools used, architectural workflow, and real examples of AI-generated output that had to be fixed or discarded.

---

## 1. AI Tools & Environments Used
- **Agentic IDE**: Google Deepmind Antigravity IDE with Gemini 3.7 / Advanced AI Coding Assistant.
- **Role & Workflow**:
  - Accelerated exploratory data analysis on the 10,000-row `transactions.json` dataset.
  - Automated initial boilerplate for FastAPI endpoints and Pydantic v2 schemas.
  - Generated design token styles and custom HTML/CSS table scaffolding.
  - Formulated comprehensive automated test cases with pytest.

---

## 2. Real Examples of AI Output Fixed or Discarded

### Example 1: SQLAlchemy 2.0 Conditional Aggregation Syntax Error
- **What AI Initially Generated**:
  The AI initially wrote the following conditional aggregation query for `TransactionService.get_transactions`:
  ```python
  # Initial AI Output (Failed)
  stats_query = query.with_entities(
      func.count(Transaction.id).label("total_count"),
      func.sum(func.case((Transaction.status == "SUCCESS", 1), else_=0)).label("success_count"),
  ).first()
  ```
- **Why It Failed**:
  In SQLAlchemy 2.0, `func.case` is a generic function generator that does not accept keyword argument `else_`. Calling this caused `TypeError: Function.__init__() got an unexpected keyword argument 'else_'` during API execution.
- **How It Was Fixed**:
  Discarded the `func.case` call and replaced it with SQLAlchemy's native `case` construct:
  ```python
  from sqlalchemy import case, func

  stats_query = query.with_entities(
      func.count(Transaction.id).label("total_count"),
      func.coalesce(func.sum(case((Transaction.status == "SUCCESS", 1), else_=0)), 0).label("success_count"),
  ).first()
  ```

---

### Example 2: Windows Console Unicode Encoding in Database Seed Script
- **What AI Initially Generated**:
  The AI generated a CLI database seeder with modern Unicode emojis for progress logging:
  ```python
  # Initial AI Output (Failed on Windows PowerShell)
  print("🚀 Digital Alpha Technology Database Seeder")
  print("  ✓ Schema initialized successfully.")
  print("  🎉 SEED COMPLETED SUCCESSFULLY")
  ```
- **Why It Failed**:
  On Windows environments running PowerShell with standard default `cp1252` encoding, printing multi-byte unicode characters directly to stdout raised:
  `UnicodeEncodeError: 'charmap' codec can't encode character '\U0001f680' in position 0: character maps to <undefined>`.
- **How It Was Fixed**:
  Sanitized all CLI outputs to robust, cross-platform ASCII markers (`>>`, `[OK]`, `->`, `*`), ensuring reliable one-command execution on any Windows, macOS, or Linux machine.

---

### Example 3: C-Extension Driver Incompatibility on Python 3.14
- **What AI Initially Generated**:
  The AI initially placed `psycopg2-binary==2.9.9` in `requirements.txt`.
- **Why It Failed**:
  On Python 3.14, pre-compiled binary wheels for `psycopg2-binary` do not exist on PyPI, causing pip to attempt building from C source and failing with `Error: pg_config executable not found`.
- **How It Was Fixed**:
  Configured `pg8000` (pure Python Postgres driver) and `psycopg 3` with automatic fallback, guaranteeing zero-friction installation on all Python releases without requiring MSVC build tools or PostgreSQL developer packages.
