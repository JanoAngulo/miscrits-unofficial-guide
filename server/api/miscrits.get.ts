import type { Miscrit } from '#shared/types/miscrit'
// Written by scripts/build-data.ts before every dev, build and generate.
import miscrits from '../data/miscrits.json'

export default defineEventHandler(() => miscrits as Miscrit[])
