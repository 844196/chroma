# Implementation Tasks

## Tasks

- [x] Remove `CHROMA_RUNTIME_DIR` environment variable definition from [src/cli/chromad.ts](../../../src/cli/chromad.ts)
  - Remove `.env()` call for `CHROMA_RUNTIME_DIR`
  - Keep `--runtime-dir` option with existing default value

- [x] Update tests (if any) that use `CHROMA_RUNTIME_DIR` environment variable
  - Search for test files that reference `CHROMA_RUNTIME_DIR`
  - Update tests to use `--runtime-dir` option instead

- [x] Run `mise run check` to verify code quality
  - Ensure no type errors
  - Ensure no lint errors
  - Ensure formatting is correct

- [x] Run `mise run test` to verify all tests pass

- [x] Run `mise run build` to verify the build succeeds

## Dependencies

Tasks should be completed in order. No parallel work required.

## Validation

After completing all tasks:
- `chromad --help` should not show `CHROMA_RUNTIME_DIR` environment variable
- `chromad --runtime-dir /custom/path` should work correctly
- `chromad` without options should use default runtime directory
- Setting `CHROMA_RUNTIME_DIR` environment variable should have no effect on runtime directory selection
