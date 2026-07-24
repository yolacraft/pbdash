import {Header} from "@/components/Header";

function home(){
    return (
        <div className="bg-gray-900 min-h-screen text-white flex flex-col relative overflow-hidden">

            {/* Dekorativer Glow-Hintergrund */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-56 left-1/2 -translate-x-1/2 w-[70rem] h-[70rem] bg-purple-700/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col flex-1">
                <Header />

                <main className="flex flex-col items-center w-full px-4 mt-10 md:mt-16 pb-16">
                    <span className="text-4xl md:text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500">
                        PB Dash Bot
                    </span>

                    <div className="w-full max-w-xl mt-10 flex flex-col items-center gap-6 bg-gradient-to-b from-purple-900/20 to-transparent border border-purple-900/40 p-6 md:p-8">
                        <img
                            src="/bot.png"
                            alt="PB Dash Bot Beispiel"
                            className="border border-gray-700 shadow-xl shadow-black/30 w-full"
                        />

                        <span className="text-lg md:text-xl text-center text-gray-200">
                            Nutze <span className="text-yellow-300 font-mono font-semibold">!join</span> im Chat oder klicke unten,
                            um den Bot zu deinem Kanal hinzuzufügen.
                        </span>

                        <a
                            href="https://twitch.tv/pbdashbot/chat"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-[#9146FF] hover:bg-[#7c2ee6] transition-colors text-white text-sm md:text-base font-semibold px-6 py-3 rounded-full"
                        >
                            Bot hinzufügen
                        </a>
                    </div>
                </main>
            </div>
        </div>
    )
}
export default home
