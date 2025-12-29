export type UpdateCampaignScanResponse = {
  data?: unknown
  message?: string
}

export async function updateCampaignTotalScans(name: string): Promise<UpdateCampaignScanResponse> {
  const res = await fetch("/api/campaign/update-total-scans", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to update campaign scan: ${res.status} - ${text}`)
  }

  return res.json()
}
