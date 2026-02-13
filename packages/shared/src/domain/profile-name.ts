import { Schema } from 'effect'

const DefaultProfileName = Schema.Literal('Default').annotations({
  description: 'Default Chrome profile',
})

const NonDefaultProfileName = Schema.String.pipe(Schema.pattern(/^Profile [1-9][0-9]*$/)).annotations({
  description: 'Non-default Chrome profile directory name (e.g. "Profile 1")',
})

export const ProfileName = Schema.Union(DefaultProfileName, NonDefaultProfileName)
  .pipe(Schema.brand('ProfileName'))
  .annotations({
    description: 'Chrome profile directory name ("Default" or "Profile N")',
  })

export type ProfileName = typeof ProfileName.Type
