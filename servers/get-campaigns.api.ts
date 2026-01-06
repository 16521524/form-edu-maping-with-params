type CampaignResponse = {
  message?: string;
  data?: {
    name?: string;
    campaign_name?: string;
    [key: string]: any;
  }[];
};

export async function getCampaigns(): Promise<CampaignResponse> {
  const res = await fetch("/api/campaigns", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load campaigns: ${res.status}`);
  }
  return res.json();
}
