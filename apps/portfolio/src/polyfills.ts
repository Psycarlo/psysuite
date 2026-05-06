// oxlint-disable no-extend-native, unicorn/consistent-function-scoping, unicorn/no-array-sort

if (typeof Array.prototype.toSorted !== 'function') {
  Object.defineProperty(Array.prototype, 'toSorted', {
    configurable: true,
    value<T>(this: T[], compareFn?: (a: T, b: T) => number): T[] {
      return [...this].sort(compareFn)
    },
    writable: true
  })
}
