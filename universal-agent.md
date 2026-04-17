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

Documentation files (`README.md`, `progress.log`, `agent-notes.md`, `ideas.md`) should **only be updated when the user explicitly asks**. However, after completing every task, you **MUST remind** the user that the documentation files haven't been updated yet and ask if they'd like you to update them.

## Git Rules

1. **Always commit** after completing a task or a logical chunk of work.
2. **Never push** unless the user explicitly asks you to push. Always remind the user that changes have been committed but not pushed.

## File Structure Rules

1. **Max ~300 lines per code file.** Before writing any code file, verify that the planned content will fit within this limit. If it won't, split it into multiple files upfront — don't create monoliths that need refactoring later.
2. **Folder-based modules.** When multiple files share functions or state, group them into a dedicated folder. Each file in the folder should have a clear, single responsibility.
3. **Splitting existing files.** When a file grows beyond ~300 lines and must be split:
   - **Never delete the original file.** Keep it intact as a backup. Only delete it when the user explicitly asks you to, after they have tested and confirmed the split files work correctly.
   - After creating all new split files, **compare** the combined content of the split files against the original to ensure nothing was lost or duplicated.
   - **Verify all connected files.** Check every file that imports, references, or interacts with the original file. Identify all variable names, function names, and references used across files and verify there are no **naming collisions** (e.g., `const` vs `var` redeclaration, global scope conflicts, namespace collisions).
   - **Test for bugs** — run the app and verify all functionality works with the new split files.
   - **Remind the user** that the original file still exists and hasn't been deleted, and ask if they'd like to delete it after testing.

## Workflow

1. Read `README.md`
2. Read `progress.log`
3. Read `agent-notes.md`
4. Read `ideas.md`
5. Understand current context
6. Proceed with the task
7. Commit changes
8. Remind user: documentation not yet updated, push not yet done
