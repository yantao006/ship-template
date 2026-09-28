// Mail lives in a separate namespace and never crosses the client navigation boundary.
export function browserNavCopy<T extends { nav: object; signIn: object; invites: object; handoff: object }>(copy: T) {
  return { ...copy.nav, ...copy.signIn, ...copy.invites, ...copy.handoff } as T['nav'] & T['signIn'] & T['invites'] & T['handoff'];
}
