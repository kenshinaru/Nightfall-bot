import { performance } from "perf_hooks";

export default {
    name: ["ping"],
    command: ["ping"],
    tags: ["miscs"],
    run: async (m, { sock, command, text }) => {
        const timestamp = performance.now();
        const latensi = performance.now() - timestamp;
        const cpuSpeed = `*Ping :* ${latensi.toFixed(4)} Detik`;
        await sock.reply(m.chat, cpuSpeed, m)
    },
    wait: true,
};