# Fix: Story Generation 500 Error (JSON Truncation)

## Top-Level Overview

The `POST /generate-story` endpoint returns HTTP 500 because IBM Granite truncates
its output mid-JSON when the story is too long to fit in the fixed `max_tokens=3500`
budget. Both the first generation attempt and the automatic JSON-format retry
produce truncated/invalid JSON, causing unhandled `JSONDecodeError` exceptions
that propagate as a 500 to the client.

Two changes fix this:
1. **Scale `max_tokens` by story length** so longer stories always have enough
   token headroom to complete the JSON output.
2. **Catch the unrecoverable parse failure** after both attempts and raise a
   proper HTTP 503 (with a user-friendly message) instead of letting the raw
   exception produce a 500.

---

## Sub-Tasks

---

### Sub-Task 1 — Scale `max_tokens` by story length

**Intent**
The root cause is that `_build_model(max_tokens=3500)` is called with a fixed
budget regardless of whether the story is 5 pages ("short"), 10 pages ("medium"),
or 20 pages ("lengthy"). A 20-page story with quiz and vocabulary items easily
exceeds 3 500 tokens, so the model stops generating mid-JSON. Passing
the `length` value into `_build_model` and choosing an appropriate budget per
length prevents truncation before it happens.

**Expected Outcomes**
- Short stories (5 pages) use ~2 500 tokens.
- Medium stories (10 pages) use ~4 500 tokens.
- Lengthy stories (20 pages) use ~8 000 tokens.
- The model completes the full JSON in a single call for all three lengths.

**Todo List**
1. Add a `length` parameter to `_build_model()` in `backend/services/ibm_granite.py`.
2. Inside `_build_model`, replace the hardcoded `max_tokens=3500` with a lookup:
   `{"short": 2500, "medium": 4500, "lengthy": 8000}[length]`.
3. Update the call site in `generate_story()` to pass `req.length` to `_build_model`.

**Relevant Context**
- `_build_model` — `backend/services/ibm_granite.py` line 40
- `generate_story` — `backend/services/ibm_granite.py` line 208, calls `_build_model(max_tokens=3500)`
- `page_count` mapping — `backend/services/ibm_granite.py` line 76 (`{"short": 5, "medium": 10, "lengthy": 20}`)

**Status:** [ ] pending

---

### Sub-Task 2 — Handle unrecoverable JSON parse failure gracefully

**Intent**
Even with a larger token budget, the model can occasionally produce malformed
JSON (e.g. unescaped quotes inside story text). Currently, if both parse
attempts fail, the `JSONDecodeError` propagates unhandled and FastAPI returns a
500. The fix wraps the second parse failure in a `try/except` and raises an
`HTTPException(status_code=503)` with a clear, user-friendly message.

**Expected Outcomes**
- A parse failure after both attempts returns HTTP 503 (not 500) with a JSON body:
  `{"detail": {"error": "generation_failed", "message": "...friendly text..."}}`.
- The raw `JSONDecodeError` is logged at ERROR level before raising so the
  developer can still see the raw model output.
- The FastAPI 500 / ASGI traceback disappears from the server log for this case.

**Todo List**
1. In `_generate_and_parse` (inner function inside `generate_story`), wrap the
   call to `_extract_json(raw2)` in a `try/except (ValueError, json.JSONDecodeError)`.
2. On failure, log the raw model output at ERROR level.
3. Raise `HTTPException(status_code=503, detail={...})` with a friendly message.
4. Import `HTTPException` from `fastapi` at the top of `ibm_granite.py`
   (or raise a plain `RuntimeError` and catch it in `main.py` — keep the
   change minimal; raising `HTTPException` directly in the service is simpler).

**Relevant Context**
- `_generate_and_parse` inner function — `backend/services/ibm_granite.py` lines 214–228
- `_extract_json` — `backend/services/ibm_granite.py` lines 62–71
- `generate_story_endpoint` in `backend/main.py` line 54 (currently no try/except)

**Status:** [ ] pending
