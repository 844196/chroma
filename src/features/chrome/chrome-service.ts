import { type ChromeLauncher } from './chrome-launcher/chrome-launcher.ts'
import { ProfileAliasResolver } from './profile-alias-resolver.ts'
import type { Profile, ProfileAlias } from './profile.ts'

export class ChromeService {
  #profileAliasResolver: ProfileAliasResolver
  #launcher: ChromeLauncher

  constructor(
    profileAliasResolver: ProfileAliasResolver,
    launcher: ChromeLauncher,
  ) {
    this.#profileAliasResolver = profileAliasResolver
    this.#launcher = launcher
  }

  async open(...args: string[]): Promise<void> {
    await this.#launcher.launch(null, ...args)
  }

  async openAs(profileOrAlias: Profile | ProfileAlias, ...args: string[]): Promise<void> {
    const profile = this.#profileAliasResolver.resolve(profileOrAlias)

    await this.#launcher.launch(profile, ...args)
  }
}
