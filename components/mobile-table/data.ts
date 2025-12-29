export type Lead = {
  id: string;
  name: string;
  role: string;
  stage: string;
  status: string;
  source: string;
  segment: string;
  leadScore: string;
  conversionRate: string;
  consultant: string;
  major: string;
  topic: string;
};

export const leads: Lead[] = [
  {
    id: "1",
    name: "Minh Ngọc",
    role: "Phụ huynh",
    stage: "Prospecting",
    status: "Disqualified",
    source: "Zalo",
    segment: "Parent-Driven",
    leadScore: "3.5",
    conversionRate: "75%",
    consultant: "Ngọc Minh",
    major: "Răng-Hàm-Mặt Điều dưỡng",
    topic: "GDU Life Kí túc xá",
  },
  {
    id: "2",
    name: "An Nhiên",
    role: "Học sinh",
    stage: "Engagement",
    status: "Profile Created",
    source: "Facebook",
    segment: "Immigration/ Career Abroad",
    leadScore: "3.5",
    conversionRate: "75%",
    consultant: "Tuấn An",
    major: "Ngôn Ngữ Anh Đông Phương Học",
    topic: "Giảng viên Câu lạc bộ",
  },
  {
    id: "3",
    name: "Ngọc My",
    role: "Phụ huynh",
    stage: "Qualifying",
    status: "AI Validated",
    source: "Website",
    segment: "High-Achiever Scholarship Hunter",
    leadScore: "3.5",
    conversionRate: "75%",
    consultant: "An Bình",
    major: "Luật Quản trị Khách sạn",
    topic: "GDU Life Tiếng Anh",
  },
  {
    id: "4",
    name: "An Nhiên",
    role: "Học sinh",
    stage: "Advising",
    status: "Nurturing",
    source: "Tiktok",
    segment: "Brand/Ranking Seeker",
    leadScore: "3.5",
    conversionRate: "75%",
    consultant: "Tuấn An",
    major: "Răng-Hàm-Mặt Điều dưỡng",
    topic: "Giảng viên Câu lạc bộ",
  },
  {
    id: "5",
    name: "Minh An",
    role: "Phụ huynh",
    stage: "Closing",
    status: "Enrolled & Paid",
    source: "Tiktok",
    segment: "Career Accelerator",
    leadScore: "3.5",
    conversionRate: "75%",
    consultant: "An Bình",
    major: "Ngôn Ngữ Anh Đông Phương Học",
    topic: "GDU Life Kí túc xá",
  },
  {
    id: "6",
    name: "Lan Chi",
    role: "Học sinh",
    stage: "Closing",
    status: "Enrolled & Paid",
    source: "Tiktok",
    segment: "Career Accelerator",
    leadScore: "3.5",
    conversionRate: "75%",
    consultant: "An Bình",
    major: "Ngôn Ngữ Anh Đông Phương Học",
    topic: "GDU Life Kí túc xá",
  },
  {
    id: "7",
    name: "Bảo An",
    role: "Phụ huynh",
    stage: "Prospecting",
    status: "Disqualified",
    source: "Zalo",
    segment: "Parent-Driven",
    leadScore: "3.5",
    conversionRate: "75%",
    consultant: "Ngọc Minh",
    major: "Răng-Hàm-Mặt Điều dưỡng",
    topic: "GDU Life Kí túc xá",
  },
];
