# crossroads-notes

Obsidian plugin that bridges the Empusa workflow engine and Hecate-bootstrap
platform layer into a structured note-taking workflow.

## Features

- **Workspace notes** from `.empusa-workspace.json` metadata
- **Release review notes** from changelogs and local git history
- **ADR notes** for architecture decisions
- **Session notes** for working sessions
- **Finding notes** for security findings and observations
- **Open linked code folder** from note frontmatter

## Commands

All commands are accessible via the command palette (`Ctrl/Cmd+P`):

| Command | Description |
| --- | --- |
| Crossroads: Create workspace note | Generate a workspace note from a `.empusa-workspace.json` file |
| Crossroads: Create release review note | Review a tagged release with changelog and commit history |
| Crossroads: Create ADR note | Scaffold an architecture decision record |
| Crossroads: Create session note | Scaffold a working session note |
| Crossroads: Create finding note | Scaffold a finding/observation note |
| Crossroads: Open linked code folder | Open the code folder linked in the current note |

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| Empusa repo path | *(empty)* | Absolute path to the local Empusa repo |
| Hecate repo path | *(empty)* | Absolute path to the local Hecate-bootstrap repo |
| Workspaces folder | `Workspaces` | Vault folder for workspace notes |
| Releases folder | `Releases` | Vault folder for release review notes |
| ADR folder | `ADR` | Vault folder for ADR notes |
| Sessions folder | `Sessions` | Vault folder for session notes |
| Findings folder | `Findings` | Vault folder for finding notes |
| Confirm before folder create | `true` | Ask before creating missing folders |
| Git executable path | `git` | Path to git binary |

## Design

See `crossroads-notes-spec.md` for the full v1 design specification.

## Development

```bash
npm install
npm run dev     # watch mode
npm run build   # production build
npm test        # run tests
```

## License

GPL-3.0-or-later
