export type LeadRecord = {
  name: string;
  lead_name: string;
  custom_role: string | null;
  mobile_no: string | null;
  email: string | null;
  organization: string | null;
  custom_stage: string | null;
  status: string | null;
  gender: string | null;
  lead_owner: string | null;
  first_name: string | null;
  custom_referral_user: string | null;
  custom_referral_user_2: string | null;
  custom_referral_user_3: string | null;
  custom_major: string | null;
  custom_entry_year: string | null;
  custom_national_id: string | null;
  custom_note: string | null;
  image: string | null;
  source: string | null;
  _assign?: string | null;
  custom_nurturing_day?: string | null;
  creation?: string | null;
  modified?: string | null;
  custom_messenger_conversation?: string | null;
  segment?: string | null;
  summary?: string | null;
  stage_position?: number | null;
  profile?: string | null;
  stage_conversion_rate?: string | null;
};

export type LeadResponse = {
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  message: string;
  data: LeadRecord[];
};
