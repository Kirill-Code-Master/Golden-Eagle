export const getProductImageSrc = (image) => {
  const value = image?.trim()

  if (!value) return ''
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('/')) return value
  if (value.startsWith('data:') || value.startsWith('blob:')) return value

  return `/${value}`
}
