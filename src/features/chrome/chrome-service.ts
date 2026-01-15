import { ChromeLauncher } from './launcher/launcher.ts'
import { Profile, ProfileAlias, ProfileAliasMap, ProfileSchema } from './profile.ts'

export class ChromeService {
  #profileAliases: ProfileAliasMap
  #launcher: ChromeLauncher

  constructor(
    profileAliases: ProfileAliasMap,
    launcher: ChromeLauncher,
  ) {
    this.#profileAliases = profileAliases
    this.#launcher = launcher
  }

  async open(profileOrAlias: Profile | ProfileAlias | null, ...args: string[]): Promise<void> {
    let profile: Profile | null = null
    if (profileOrAlias !== null) {
      const resolved = this.#profileAliases.get(profileOrAlias)
      profile = resolved === undefined ? ProfileSchema.parse(profileOrAlias) : resolved
    }

    await this.#launcher.launch(profile, ...args)
  }
}
