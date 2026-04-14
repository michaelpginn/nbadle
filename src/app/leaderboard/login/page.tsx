export const metadata = {
  title: "NBAdle — Leaderboard Login",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-white/10 rounded-3xl shadow-2xl p-10 w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight">
            NBA<span className="text-orange-400">dle</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">Leaderboard access</p>
        </div>

        <form action="/api/leaderboard-login" method="POST" className="flex flex-col gap-4">
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoFocus
            className="bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-400 transition-colors"
          />
          <button
            type="submit"
            className="bg-white text-black font-bold rounded-xl py-3 hover:bg-gray-200 active:scale-95 transition-all"
          >
            Enter
          </button>
        </form>

        {/* Show error after searchParams resolves */}
        <ErrorMessage searchParams={searchParams} />
      </div>
    </main>
  );
}

async function ErrorMessage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  if (!params.error) return null;
  return (
    <p className="text-red-400 text-sm text-center -mt-2">Incorrect password</p>
  );
}
