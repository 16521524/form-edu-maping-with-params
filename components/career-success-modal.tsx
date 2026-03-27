"use client";

import Image from "next/image";
import { Check, X } from "lucide-react";

type SuccessAction = {
  href: string;
  label: string;
  iconSrc: string;
  iconAlt: string;
  iconClassName?: string;
};

export type FormSuccessModalProps = {
  title?: string;
  description?: string;
  actions?: SuccessAction[];
  onClose?: () => void;
};

const defaultActions: SuccessAction[] = [
  {
    href: "https://www.facebook.com/TruongDaihocGiaDinh",
    label: "Theo dõi Fanpage ngay",
    iconSrc: "/social/facebook.png",
    iconAlt: "Facebook",
  },
  {
    href: "https://zalo.me/3316654788581087911",
    label: "Theo dõi Zalo ngay",
    iconSrc: "/social/zalo.png",
    iconAlt: "Zalo",
  },
  {
    href: "https://www.tiktok.com/@daihocgiadinh",
    label: "Theo dõi Tiktok ngay",
    iconSrc: "/social/tiktok.png",
    iconAlt: "Tiktok",
    iconClassName: "bg-white p-[3px] object-contain",
  },
];

export default function FormSuccessModal({
  title = "Đăng ký thành công",
  description = "Thông tin của bạn đã được ghi nhận. Theo dõi các kênh bên dưới để nhận thêm thông tin mới nhất từ trường.",
  actions = defaultActions,
  onClose,
}: FormSuccessModalProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-black/60 px-2 py-6 sm:p-6"
      role="dialog"
      aria-modal="true"
      onClick={() => onClose?.()}
    >
      <div
        className="relative w-[88%] max-w-[430px] rounded-[24px] bg-[#E5EAF5] px-6 py-10 text-center shadow-[0_20px_48px_rgba(0,0,0,0.22)] sm:rounded-[32px] sm:px-8 sm:py-14"
        onClick={(event) => event.stopPropagation()}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng thông báo thành công"
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#00294D] shadow-sm transition hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="mx-auto mb-7 flex h-[80px] w-[80px] items-center justify-center rounded-full bg-[#50B566] sm:mb-10 sm:h-[120px] sm:w-[120px]">
          <Check
            className="h-10 w-10 text-white sm:h-[64px] sm:w-[64px]"
            strokeWidth={6}
          />
        </div>

        <p className="mb-3 text-[30px] font-extrabold leading-[1.08] text-[#00294D]">
          {title}
        </p>
        <p className="mx-auto mb-8 max-w-[320px] text-sm leading-6 text-[#27496B] sm:mb-10 sm:text-[15px]">
          {description}
        </p>

        {actions.length > 0 && (
          <div className="mx-auto flex w-full max-w-[460px] flex-col gap-4 sm:gap-5">
            {actions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mx-auto inline-flex h-[56px] w-full items-center justify-center gap-3 rounded-full bg-[#00294D] px-6 text-[14px] font-semibold text-white shadow-[0_14px_26px_rgba(0,41,77,0.25)] transition hover:brightness-110 active:scale-[0.99] sm:h-[68px] sm:w-[92%] sm:px-8"
              >
                <Image
                  src={action.iconSrc}
                  alt={action.iconAlt}
                  width={24}
                  height={24}
                  className={`h-6 w-6 rounded-full ${action.iconClassName || ""}`}
                />
                {action.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { FormSuccessModal };
