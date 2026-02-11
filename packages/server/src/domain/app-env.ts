import { Context } from 'effect'

export class AppEnv extends Context.Tag('@chroma/server/domain/AppEnv')<AppEnv, 'development' | 'production'>() {}
