import { type Profile, type ProfileAlias, type ProfileAliasMap, ProfileSchema } from './profile.ts'

export class ProfileAliasResolver {
  #aliases: ProfileAliasMap

  constructor(aliases: ProfileAliasMap) {
    this.#aliases = aliases
  }

  resolve(profileOrAlias: Profile | ProfileAlias): Profile | null {
    const resolved = this.#aliases.get(profileOrAlias)
    if (resolved !== undefined) {
      return resolved
    }

    const parsed = ProfileSchema.safeParse(profileOrAlias)
    if (parsed.success) {
      return parsed.data
    }

    return null
  }
}
