export type Gender = 'm' | 'w' | 'd'

export type Strain = {
  readonly id: string
  readonly name: string
  readonly imageDataUrl?: string
  readonly stockGrams: number
  readonly thc: number
  readonly cbd: number
  readonly info: readonly string[]
}

export type Disbursement = {
  readonly id: string
  readonly strainId: string
  readonly strainName: string
  readonly time: string // HH:MM
  readonly grams: number
  readonly over21: boolean
  readonly gender: Gender
  readonly dateIso: string // YYYY-MM-DD
}
