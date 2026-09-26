import type { Miscrit } from '#shared/types/miscrit'
// Written by scripts/build-data.ts before every dev, build and generate.
import miscrits from '../../data/miscrits.json'

// A line is named by its first form, as the list links it.
const bySlug = new Map((miscrits as Miscrit[]).map(m => [m.slugs[0]!, m]))

export default defineEventHandler((event) => {
  const miscrit = bySlug.get(getRouterParam(event, 'slug') ?? '')
  if (!miscrit) throw createError({ statusCode: 404, statusMessage: 'No such miscrit' })
  return miscrit
})
