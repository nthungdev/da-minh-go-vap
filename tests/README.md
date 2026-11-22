# Tests

Test files are organized by scope:

| Type        | Location                         | Included in `pnpm test` |
| ----------- | -------------------------------- | ----------------------- |
| Unit        | `src/**/*.test.ts` (colocated)   | Yes                     |
| Integration | `tests/integration/**/*.test.ts` | Yes                     |
| E2E         | `tests/e2e/**/*.test.ts`         | No (run explicitly)     |

## Running Tests

```bash
# Run all unit and integration tests
pnpm test

# Watch mode
pnpm test:watch

# Run a single test file
node --test src/utils/env.test.ts
```
