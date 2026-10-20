---
description: Consolidate this conversation's decisions into the project memory (CLAUDE.md rule 2)
---

Consolidate the memory of this conversation into the project memory — `MEMORY.md` (index) and `docs/memory/<topic>.md` (topic files) — following rule 2 of `CLAUDE.md`.

Procedure:

1. Re-read `MEMORY.md` in full (structure, "how to maintain", topic table), then the topic files relevant to what this conversation touched.
2. Review **the whole** conversation (every task, not only the last one) and extract what a future agent should know that is **neither in the code nor in `git log`**:
   - design / product / rule decisions and their reasons;
   - non-obvious technical choices and why the alternatives were rejected;
   - what I explicitly **rejected**, and why (so it is not proposed again);
   - traps encountered (browser behaviour, tooling, framework, hosting…) and their remedy;
   - my working preferences observed in this conversation.
3. Write it into the memory:
   - **update** an existing entry rather than creating a new one when the topic already exists; correct or delete what became false;
   - otherwise add a short entry to the right topic file (create a new file only when no topic fits, and add it to the table in `MEMORY.md`): *decision → why → how to apply*, dated `YYYY-MM-DD`;
   - update the index for cross-cutting decisions, working-style observations, open items (add / remove when done) and new topic files;
   - English, dense, factual; no session narration, no implementation detail readable in the diff, no duplicate of `CLAUDE.md`, each fact stated once.
4. Writing is the default. If this conversation truly taught nothing durable, do not touch the files and say so explicitly.
5. Show me the diff of the memory files, then commit **only** those files following rule 1 of `CLAUDE.md`. Push only in a cloud session (push the working branch and open or update its pull request); a local session does not push.
