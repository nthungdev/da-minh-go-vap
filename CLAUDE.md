# CLAUDE.md

This project uses [AGENTS.md](file:///Users/hung/Dev/da-minh-go-vap/AGENTS.md) as the primary single source of truth for AI agent workflows, conventions, code style, and development rules.

Please refer directly to [AGENTS.md](file:///Users/hung/Dev/da-minh-go-vap/AGENTS.md) for full documentation and code examples.

---

## Quick Reference

### Commands

- **Dev server**: `pnpm dev`
- **Type check**: `pnpm check-types`
- **Lint**: `pnpm lint`
- **Lint & format fix**: `pnpm lint:fix`
- **Prettier check/fix**: `pnpm prettier` / `pnpm prettier:fix`
- **Build**: `pnpm build`
- **Payload types generation**: `pnpm generate`

### Core Rules

1. **Always run lint & format at the end**: Run `pnpm lint:fix` and `pnpm check-types` before completing tasks.
2. **Use `cn` function**: Import `cn` from `@/utils/common` for all dynamic or conditional class names.
3. **Avoid convoluted lambda chaining**: Keep transformations readable, use intermediate variables, and add comments for complex logic.
4. **Targeted JSDoc**: Add JSDoc to complex functions and public APIs; omit for simple/straightforward code.
