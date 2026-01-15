export interface ChromeLauncher {
  launch(profile: string | null, ...args: string[]): Promise<void>
}
