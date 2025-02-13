import chalk from 'chalk';
import moment from 'moment-timezone';

moment.tz.setDefault('Asia/Jakarta').locale('id');

export default async (sock, m, isCmd) => {
    const formattedTime = moment().format('HH:mm:ss');
    const cmdName = isCmd ? m.body.slice(1).split(/\s+/)[0] : '';
    const isGc = m.chat.endsWith('@g.us');
    const gcName = isGc ? (await sock.groupMetadata(m.chat)).subject : '';
    const pushName = m.pushName || '-';

    if (isCmd) {
        console.log(
            chalk.white.bold('--- CMD ENTRY ---') +
            `\nTime    : ${chalk.green(formattedTime)}` +
            `\nUser    : ${chalk.cyan(pushName)}` +
            `\nID      : ${chalk.gray(m.chat)}` +
            `\nType    : ${chalk.yellow(m.type)}` +
            `\nBody    : ${chalk.magenta(cmdName)}` +
            `\n---------------`
        );
    } else {
        console.log(
            chalk.white.bold('--- MSG ENTRY ---') +
            `\nTime    : ${chalk.green(formattedTime)}` +
            `\nUser    : ${chalk.cyan(pushName)}` +
            `\nID      : ${chalk.gray(m.chat)}` +
            `\nType    : ${chalk.yellow(m.type)}` +
            `\nBody    : ${chalk.magenta((typeof m.text === 'string' && m.text) ? m.text : '-')}` +
            `\n---------------`
        );
    }
};