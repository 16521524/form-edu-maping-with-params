import { Check } from "lucide-react";

export default function CareerSuccessModal() {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/60 px-2 py-6 sm:p-6">
      {/* Card */}
      <div
        className="
          w-[88%] max-w-[430px]
          rounded-[24px] sm:rounded-[32px]
          bg-[#E5EAF5]
          px-6 sm:px-8
          py-10 sm:py-14
          text-center
          shadow-[0_20px_48px_rgba(0,0,0,0.22)]
        "
      >
        {/* Icon */}
        <div
          className="
            mx-auto
            mb-7 sm:mb-10
            flex items-center justify-center
            h-[80px] w-[80px]
            sm:h-[120px] sm:w-[120px]
            rounded-full
            bg-[#50B566]
          "
        >
          <Check
            className="text-white h-80px] w-80px] sm:h-[64px] sm:w-[64px]"
            strokeWidth={6}
          />
        </div>

        {/* Title */}
        <p
          className="
            mb-8 sm:mb-10
            text-[#00294D]
            font-extrabold
            leading-[1.08]
            text-[30px]
          "
        >
          Đã tạo thành công
        </p>

        {/* Buttons */}
        <div className="mx-auto flex w-full max-w-[460px] flex-col gap-4 sm:gap-5">
          <a
            href="https://www.facebook.com/TruongDaihocGiaDinh"
            target="_blank"
            rel="noopener noreferrer"
            className="
              mx-auto
              inline-flex items-center justify-center gap-3
              w-full sm:w-[92%]
              h-[56px] sm:h-[68px]
              rounded-full
              bg-[#00294D]
              px-6 sm:px-8
              text-[14px]
              font-semibold
              text-white
              shadow-[0_14px_26px_rgba(0,41,77,0.25)]
              transition
              hover:brightness-110
              active:scale-[0.99]
            "
          >
            <img
              src="/social/facebook.png"
              alt="Facebook"
              className="h-6 w-6 rounded-full"
            />
            Theo dõi Fanpage ngay
          </a>

          <a
            href="https://zalo.me/3316654788581087911"
            target="_blank"
            rel="noopener noreferrer"
            className="
              mx-auto
              inline-flex items-center justify-center gap-3
              w-full sm:w-[92%]
              h-[56px] sm:h-[68px]
              rounded-full
              bg-[#00294D]
              px-6 sm:px-8
              text-[14px]
              font-semibold
              text-white
              shadow-[0_14px_26px_rgba(0,41,77,0.25)]
              transition
              hover:brightness-110
              active:scale-[0.99]
            "
          >
            <img
              src="/social/zalo.png"
              alt="Zalo"
              className="h-6 w-6 rounded-full"
            />
            Theo dõi Zalo ngay
          </a>
        </div>
      </div>
    </div>
  );
}
