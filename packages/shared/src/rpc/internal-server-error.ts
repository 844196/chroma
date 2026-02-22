import { Schema } from 'effect'

/**
 * サーバー内部エラー（productionでdefectをマスク）
 */
export class InternalServerError extends Schema.TaggedError<InternalServerError>()('InternalServerError', {}) {}
