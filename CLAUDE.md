# Project Rules

## Mandatory Pre-Read Files

Before making any changes or responding to any request in this project, you **MUST** read the following files first:

1. **`README.md`** — Contains the full project documentation, architecture, and setup instructions. Read this to understand the project context.
2. **`progress.log`** — Contains a chronological record of all changes made to this project. Read this to understand the current state and recent modifications.
3. **`agent-notes.md`** — Contains high-level context, future roadmap ideas, and "lessons learned" from previous agents. Read this to avoid repeating mistakes.
4. **`ideas.md`** — Contains ideas, considerations, and features under discussion. Read this to understand what's planned or being explored.

## Why

- `README.md` ensures you understand the project's purpose, structure, and conventions before making any changes.
- `progress.log` ensures you are aware of the latest changes and don't duplicate, conflict with, or regress any recent work.
- `agent-notes.md` provides continuity of thought and helps you understand the "why" behind certain decisions.
- `ideas.md` tracks what's being considered so you don't re-propose existing ideas or miss context on planned features.

## Mandatory Post-Task Updates

After completing **every** task (no matter how small), you **MUST** do the following:

1. **Update `README.md`** — Document any changes that affect the project's architecture, features, setup, configuration, or usage. Keep the documentation accurate and up to date.
2. **Append to `progress.log`** — Log **every single change**, even the tiniest modification. Each entry should include:
   - Timestamp (YYYY-MM-DD HH:MM)
   - Brief description of what was changed
   - Files affected
3. **Update `agent-notes.md`** — Add any new insights, open questions, or "gotchas" you encountered during the task.
4. **Update `ideas.md`** — If a task sparks new ideas or resolves an existing one, update accordingly. Mark implemented ideas with ✅.

No change is too small to log. Even a one-line fix, a renamed variable, or a config tweak must be recorded in `progress.log`.

## JavaScript File Structure Rules

1. **Max ~300 lines per JS file.** Before writing any JS file, verify that the planned content will fit within this limit. If it won't, split it into multiple files upfront — don't create monoliths that need refactoring later.
2. **Folder-based modules.** When multiple JS files share functions/state (e.g., `creator/`, `remover/`), group them into a dedicated folder. Each file in the folder should have a clear, single responsibility.
3. **Splitting existing files.** When a file grows beyond ~300 lines and must be split:
   - Keep the original file intact until the split is verified.
   - After creating all new split files, **compare** the combined content of the split files against the original to ensure nothing was lost or duplicated.
   - **Test for bugs** — load the app and verify all functionality works with the new split files.
   - Only **delete the original file** after confirming the split is correct and bug-free.

## Workflow

1. Read `README.md`
2. Read `progress.log`
3. Read `agent-notes.md`
4. Read `ideas.md`
5. Understand current context
6. Proceed with the task
7. Update `README.md` with relevant documentation
8. Append all changes to `progress.log`
9. Update `agent-notes.md` with insights
10. Update `ideas.md` if applicable
