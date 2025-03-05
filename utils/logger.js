import chalk from 'chalk';
import moment from 'moment-timezone';

moment.tz.setDefault('Asia/Jakarta').locale('id');

export default async (x, y, z) => {
    const t = moment().format('HH:mm:ss');
    const a = z ? y.body.slice(1).split(/\s+/)[0] : '';
    const b = y.chat?.endsWith('@g.us');
    let c = '-';

    if (b) {
        try {
            const meta = await x.groupMetadata[y.chat]
            c = meta?.subject || '-';
        } catch (err) {
            c = '-';
        }
    }

    const d = y.pushName || '-';

    if (z) {
        console.log(
            chalk.white.bold('--- CMD ENTRY ---') +
            `\nTime    : ${chalk.green(t)}` +
            `\nUser    : ${chalk.cyan(d)}` +
            `\nID      : ${chalk.gray(y.chat)}` +
            `\nGroup   : ${chalk.blue(c)}` +
            `\nType    : ${chalk.yellow(y.type)}` +
            `\nBody    : ${chalk.magenta(a)}` +
            `\n---------------`
        );
    } else {
        console.log(
            chalk.white.bold('--- MSG ENTRY ---') +
            `\nTime    : ${chalk.green(t)}` +
            `\nUser    : ${chalk.cyan(d)}` +
            `\nID      : ${chalk.gray(y.chat)}` +
            `\nGroup   : ${chalk.blue(c)}` +
            `\nType    : ${chalk.yellow(y.type)}` +
            `\nBody    : ${chalk.magenta((typeof y.text === 'string' && y.text) ? y.text : '-')}` +
            `\n---------------`
        );
    }
};
