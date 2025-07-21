export const calculateEMI = (principal: number, rate: number, tenure: number): number => {
  const r = rate / 12 / 100
  const n = tenure
  if (isNaN(principal) || isNaN(r) || isNaN(n)) return 0
  return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
}
