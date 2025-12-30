export type CareerMetadataSchoolResponse = {
  data?: {
    value?: string,
    display?: string,
  }[]
}

export async function getMetadataSchools(): Promise<CareerMetadataSchoolResponse> {
  const res = await fetch("/api/career/metadata", { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`Failed to load career metadata: ${res.status}`)
  }
  return res.json()
}
