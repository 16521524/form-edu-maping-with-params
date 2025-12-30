export const metadata = {
  title: "Đăng ký thành công",
};

export default function CareerSuccessPage() {
  return (
    <main className="min-h-screen bg-[#eef3f8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-3xl bg-[#e4e9f3] px-6 py-10 shadow-[0_14px_30px_rgba(0,0,0,0.12)] text-center">
        <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-[#4caf6a] grid place-items-center shadow-inner">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-12 w-12 text-white"
          >
            <path
              fill="currentColor"
              d="M9.5 16.2 5.8 12.5l1.4-1.4 2.3 2.3 7-7L17.9 7l-8.4 9.2Z"
            />
          </svg>
        </div>
        <p className="text-[#0f2b5a] text-2xl font-bold mb-8">
          Đã đăng ký thành công
        </p>
        {/* <a
          href="/"
          className="inline-flex items-center justify-center w-full rounded-full bg-[#0b2b55] px-6 py-3 text-white text-lg font-semibold shadow-[0_10px_20px_rgba(11,43,85,0.25)] hover:bg-[#0a254a] transition"
        >
          Quay về màn hình chính
        </a> */}
      </div>
    </main>
  );
}
