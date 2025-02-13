import treekill from "./utils/treekill.js";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

let status = null;

function start(file) {
    if (status && status.pid) {
        treekill(status.pid, "SIGTERM", (err) => {
            if (err) {
                console.log(err);
            } else {
                status = null;
                start(file);
            }
        });
    } else {
        let args = [path.join(process.cwd(), file), ...process.argv.slice(2)];
        let p = spawn(process.argv[0], args, {
            stdio: ["inherit", "inherit", "inherit", "ipc"]
        });

        p.on("message", (data) => {
            switch (data) {
                case "reset":
                    start(file);
                    break;
                case "uptime":
                    p.send(process.uptime());
                    break;
            }
        });

        p.on("exit", (code) => {
            console.error("Exited with code:", code);
            if (code === 0) return;
            fs.watchFile(args[0], () => {
                fs.unwatchFile(args[0]);
                start(file);
            });
        });

        status = p;
    }
}

start("client.js")