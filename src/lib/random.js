// Shared cryptographic random helpers used by generator.js and personal.js.

// Unbiased random integer in [min, max] inclusive using rejection sampling.
export function randomInt(min, max) {
  const range = max - min + 1
  const maxUnbiased = Math.floor(0xffffffff / range) * range
  const buf = new Uint32Array(1)
  let value
  do {
    crypto.getRandomValues(buf)
    value = buf[0]
  } while (value >= maxUnbiased)
  return min + (value % range)
}

// Fisher-Yates shuffle using the crypto randomInt above.
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
