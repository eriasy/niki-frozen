export function formatRupiah(value) {
  return 'Rp ' + Number(value || 0).toLocaleString('id-ID')
}

export function formatRupiahShort(value) {
  const num = Number(value || 0)
  if (num >= 1000000) {
    return 'Rp ' + (num / 1000000).toFixed(1).replace('.0', '') + 'jt'
  }
  if (num >= 1000) {
    return 'Rp ' + (num / 1000).toFixed(0) + 'rb'
  }
  return 'Rp ' + num
}

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function useFormat() {
  return { formatRupiah, formatRupiahShort, formatDate }
}
