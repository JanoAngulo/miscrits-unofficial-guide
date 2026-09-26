/**
 * The weekday, counted from 0 for Sunday. Null until the page has mounted: a prerendered page was built on some
 * other day, so anything that depends on today renders only once the browser has said which day it is.
 */
export function useToday() {
  const today = useState<number | null>('today', () => null)
  onMounted(() => { today.value = new Date().getDay() })
  return today
}
