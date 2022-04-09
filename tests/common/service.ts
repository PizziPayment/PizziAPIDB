export function addPadding(str: string, n: number = 2) {
  const i = str.lastIndexOf('.')
  const pad = '0'

  if (i == -1) {
    str = str + '.' + pad.repeat(n)
  } else {
    const nb_floating_digits = str.slice(i + 1).length
    str = str.padEnd(str.length + (n - nb_floating_digits), pad)
  }
  return str
}
