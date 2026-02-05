import {Header} from "@/components/Header";

function home(){
    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <Header />
            <div className="flex flex-col gap-2 items-center justify-center mt-8">
                <img src={"/bot.png"} className="border-4 rounded-md border-purple-700"/>
                <div>
                    <span className="text-2xl text-white">Nutze <span className="text-yellow-300">!join</span> <a href={"https://twitch.tv/pbdashbot/chat"} className="text-blue-500 underline">hier</a>, um den Bot zu deinem Kanal hinzuzufügen</span>
                </div>
            </div>
        </div>
    )
}
export default home