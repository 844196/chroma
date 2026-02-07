import { Schema } from 'effect'

export const ProfileName = Schema.Union(
  Schema.Literal('Default'),
  Schema.String.pipe(Schema.pattern(/^Profile [1-9][0-9]*$/)),
).pipe(Schema.brand('ProfileName'))

export type ProfileName = typeof ProfileName.Type
