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

export function formatDateShort(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function daysUntilExpiry(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(dateStr)
  expiry.setHours(0, 0, 0, 0)
  const diff = expiry - today
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days
}

export function useFormat() {
  return { formatRupiah, formatRupiahShort, formatDate, formatDateShort, daysUntilExpiry }
}
