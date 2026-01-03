export type MetadataOption = {
  value?: string
  display?: string
  text_color?: string
  background_color?: string
}

export type CareerMetadataResponse = {
  data?: {
    genders?: MetadataOption[]
    preferences?: MetadataOption[]
    provinces?: MetadataOption[]
    schools?: MetadataOption[]
    streams?: MetadataOption[]
    grades?: MetadataOption[]
    performances?: MetadataOption[]
    certificates?: MetadataOption[]
    campaigns?: MetadataOption[]
    campaign_qr_statuses?: MetadataOption[]
    lead_statuses?: MetadataOption[]
    lead_stages?: MetadataOption[]
  }
}

export async function getMetadataCareer(): Promise<CareerMetadataResponse> {
  const res = await fetch("/api/career/metadata", { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`Failed to load career metadata: ${res.status}`)
  }
  return res.json()
}
