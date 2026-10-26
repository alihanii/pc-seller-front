const numberFormat = new Intl.NumberFormat('fa-IR')
const dateFormat = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'long', day: 'numeric' })
const dateTimeFormat = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
})

/** Persian digits with thousands separators. */
export function faNumber(value: number | string) {
  return typeof value === 'number' ? numberFormat.format(value) : toFaDigits(value)
}

export function toFaDigits(value: string) {
  return value.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
}

export function toEnDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
}

/** The API stores rial; the store shows toman. */
export function rialToToman(rial: number) {
  return Math.round(rial / 10)
}

export function toman(rial: number) {
  return faNumber(rialToToman(rial))
}

export function jalaliDate(iso: string | null | undefined) {
  return iso ? dateFormat.format(new Date(iso)) : '—'
}

export function jalaliDateTime(iso: string | null | undefined) {
  return iso ? dateTimeFormat.format(new Date(iso)) : '—'
}
