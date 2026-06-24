import type { TramNetwork } from "@/backend/type/tram-network/type";

export const initialTramNetwork: TramNetwork = {
    startStopId: "tylova",
    terminalStopId: "nove_sady",
    stops: [
        { id: "tylova", name: "Tylova", x: 80, y: 300 },
        { id: "semilasso", name: "Semilasso", x: 160, y: 300 },
        { id: "husitska", name: "Husitská", x: 240, y: 300 },
        { id: "jungmannova", name: "Jungmannova", x: 320, y: 300 },
        { id: "sumavska", name: "Šumavská", x: 400, y: 300 },
        { id: "hrncirska", name: "Hrnčiřská", x: 480, y: 300 },
        { id: "pionyrska", name: "Pionýrská", x: 560, y: 300 },
        { id: "antoninska", name: "Antonínská", x: 640, y: 300 },
        { id: "moravske_namesti", name: "Moravské náměstí", x: 720, y: 300 },
        { id: "malinovskeho_namesti", name: "Malinovského náměstí", x: 820, y: 280 },
        { id: "hlavni_nadrazi", name: "Hlavní nádraží", x: 900, y: 320 },
        { id: "nove_sady", name: "Nové Sady", x: 900, y: 360 },

        { id: "kr_nadrazi", name: "Královo Pole, nádraží", x: 160, y: 220 },
    ],
    connections: [
        { id: "tylova-semilasso", fromStopId: "tylova", toStopId: "semilasso", color: "#e11d48" },
        { id: "semilasso-husitska", fromStopId: "semilasso", toStopId: "husitska", color: "#e11d48" },
        { id: "husitska-jungmannova", fromStopId: "husitska", toStopId: "jungmannova", color: "#e11d48" },
        { id: "jungmannova-sumavska", fromStopId: "jungmannova", toStopId: "sumavska", color: "#e11d48" },
        { id: "sumavska-hrncirska", fromStopId: "sumavska", toStopId: "hrncirska", color: "#e11d48" },
        { id: "hrncirska-pionyrska", fromStopId: "hrncirska", toStopId: "pionyrska", color: "#e11d48" },
        { id: "pionyrska-antoninska", fromStopId: "pionyrska", toStopId: "antoninska", color: "#e11d48" },
        { id: "antoninska-moravske_namesti", fromStopId: "antoninska", toStopId: "moravske_namesti", color: "#e11d48" },
        {
            id: "moravske_namesti-malinovskeho_namesti",
            fromStopId: "moravske_namesti",
            toStopId: "malinovskeho_namesti",
            color: "#e11d48",
        },
        {
            id: "malinovskeho_namesti-hlavni_nadrazi",
            fromStopId: "malinovskeho_namesti",
            toStopId: "hlavni_nadrazi",
            color: "#e11d48",
        },
        { id: "hlavni_nadrazi-nove_sady", fromStopId: "hlavni_nadrazi", toStopId: "nove_sady", color: "#e11d48" },

        { id: "semilasso-kr_nadrazi", fromStopId: "semilasso", toStopId: "kr_nadrazi", color: "#a3a3a3" },
    ],
};
