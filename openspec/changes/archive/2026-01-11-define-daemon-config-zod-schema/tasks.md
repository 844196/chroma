# Implementation Tasks

## Checklist

- [x] **Create schema file** (`src/types/daemon-config.ts`)
  - Import Zod from `@zod/zod/mini`
  - Import `ChromeProfileDirectorySchema` from `./chrome-profile-directory.ts`
  - Define `DaemonConfigSchema` using `z.object()` with an optional `profileAliases` field
  - Define `profileAliases` as `z.optional(z.partialRecord(ChromeProfileDirectorySchema, z.array(z.string().check(z.minLength(1))).check(z.minLength(1))))`
  - Note: Zod v4 requires `z.partialRecord()` for partial records (see https://zod.dev/v4/changelog?id=zrecord)
  - Export `DaemonConfig` type using `z.infer<typeof DaemonConfigSchema>`
  - Verify schema matches specification requirements

- [x] **Create test file** (`src/types/daemon-config.test.ts`)
  - Import `DaemonConfigSchema` and required test utilities
  - Test: Empty object `{}` passes validation
  - Test: Object with empty `profileAliases` object `{"profileAliases": {}}` passes validation (partial record)
  - Test: Object with valid `profileAliases` passes validation
  - Test: Object with `profileAliases` containing `Default` and `Profile N` keys passes validation
  - Test: Invalid profile keys (`Profile 0`, `profile 1`, `Profile`) fail validation
  - Test: Invalid value types (string instead of array) fail validation
  - Test: Unknown additional properties are ignored (stripped) and validation succeeds
  - Verify all error messages are meaningful

- [x] **Run type checks**
  - Execute `mise run check:type -- src/types/daemon-config.ts src/types/daemon-config.test.ts`
  - Fix any TypeScript compilation errors
  - Verify no type errors in related files

- [x] **Run tests**
  - Execute `mise run test -- src/types/daemon-config.test.ts`
  - Verify all test cases pass
  - Check test coverage meets requirements (all scenarios covered)

- [x] **Run format & lint checks**
  - Execute `mise run check:format -- src/types/daemon-config.ts src/types/daemon-config.test.ts`
  - Execute `mise run check:lint -- src/types/daemon-config.ts src/types/daemon-config.test.ts`
  - Apply auto-fixes if needed using `mise run fix -- <files>`

- [x] **Verify integration readiness**
  - Confirm schema can be imported in other modules
  - Verify `DaemonConfig` type is correctly exported and usable
  - Check that schema structure matches `config-file` specification requirements

## Dependencies

- `src/types/chrome-profile-directory.ts` (existing)
- `@zod/zod` package (already in `deno.jsonc`)

## Notes

- This change is purely additive - no existing code is modified
- The schema is designed to be consumed by future configuration loading logic
- All validation logic is encapsulated in the Zod schema definition
