/**
 * Returns a debounced wrapper around `fn` that auto-cancels on component unmount.
 */
export const useDebounce = <T extends (...args: never[]) => unknown>(
  fn: T,
  delay: number,
) => {
  let timer: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  onUnmounted(cancel)

  return { debounced, cancel }
}
