export type CareerMetadataResponse = {
  data?: {
    genders?: string[]
    preferences?: string[]
    provinces?: string[]
    schools?: { value: string; display: string }[]
    streams?: string[]
    grades?: string[]
    performances?: string[]
    certificates?: string[]
  }
}

export async function getMetadataCareer(): Promise<CareerMetadataResponse> {
  const res = await fetch("/api/career/metadata", { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`Failed to load career metadata: ${res.status}`)
  }
  return res.json()
}
