import { assertEquals, assertMatch, assertThrows } from '@std/assert'
import { afterEach, describe, it } from '@std/testing/bdd'
import { restore, stub } from '@std/testing/mock'
import { defaultConfigPath, defaultRuntimeDir } from './runtime.ts'

const ORIGINAL_DENO_ENV_GET = Deno.env.get

describe('defaultConfigPath', () => {
  afterEach(() => {
    restore()
  })

  describe('when XDG_CONFIG_HOME is set', () => {
    it('should return the correct path', () => {
      stub(Deno.env, 'get', (k) => {
        switch (k) {
          case 'XDG_CONFIG_HOME': {
            return '/path/to/config-home'
          }
          default: {
            return ORIGINAL_DENO_ENV_GET.call(Deno.env, k)
          }
        }
      })

      assertEquals(defaultConfigPath(), '/path/to/config-home/chroma/config.json')
    })
  })

  describe('when XDG_CONFIG_HOME is not set', () => {
    it('should return the fallback path', () => {
      stub(Deno.env, 'get', (k) => {
        switch (k) {
          case 'XDG_CONFIG_HOME': {
            return undefined
          }
          default: {
            return ORIGINAL_DENO_ENV_GET.call(Deno.env, k)
          }
        }
      })

      // stub() cannot mock os.homedir(), so just use assertMatch()
      assertMatch(defaultConfigPath(), /^.+\/\.config\/chroma\/config\.json$/)
    })
  })
})

describe('defaultRuntimeDir', () => {
  afterEach(() => {
    restore()
  })

  describe('when XDG_RUNTIME_DIR is set', () => {
    it('should return the correct path', () => {
      stub(Deno.env, 'get', (k) => {
        switch (k) {
          case 'XDG_RUNTIME_DIR': {
            return '/path/to/runtime-dir'
          }
          default: {
            return ORIGINAL_DENO_ENV_GET.call(Deno.env, k)
          }
        }
      })

      assertEquals(defaultRuntimeDir(), '/path/to/runtime-dir/chroma')
    })
  })

  describe('when XDG_RUNTIME_DIR is not set', () => {
    describe('and TMPDIR is set', () => {
      it('should return the runtime dir path in TMPDIR', () => {
        stub(Deno.env, 'get', (k) => {
          switch (k) {
            case 'XDG_RUNTIME_DIR': {
              return undefined
            }
            case 'TMPDIR': {
              return '/path/to/tmpdir'
            }
            default: {
              return ORIGINAL_DENO_ENV_GET.call(Deno.env, k)
            }
          }
        })
        stub(Deno, 'uid', () => 65534)

        assertEquals(defaultRuntimeDir(), '/path/to/tmpdir/chroma-65534')
      })
    })

    describe('and TMPDIR is not set', () => {
      it('should return the runtime dir path in /tmp', () => {
        stub(Deno.env, 'get', (k) => {
          switch (k) {
            case 'XDG_RUNTIME_DIR': {
              return undefined
            }
            case 'TMPDIR': {
              return undefined
            }
            default: {
              return ORIGINAL_DENO_ENV_GET.call(Deno.env, k)
            }
          }
        })
        stub(Deno, 'uid', () => 65534)

        assertEquals(defaultRuntimeDir(), '/tmp/chroma-65534')
      })
    })

    describe('and Deno.uid() returns null', () => {
      it('should throw an error', () => {
        stub(Deno.env, 'get', (k) => {
          switch (k) {
            case 'XDG_RUNTIME_DIR': {
              return undefined
            }
            default: {
              return ORIGINAL_DENO_ENV_GET.call(Deno.env, k)
            }
          }
        })
        stub(Deno, 'uid', () => null)

        assertThrows(() => defaultRuntimeDir())
      })
    })
  })
})
