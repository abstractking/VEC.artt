declare module 'os-browserify/browser' {
    const os: {
        endianness(): string;
        hostname(): string;
        loadavg(): number[];
        uptime(): number;
        freemem(): number;
        totalmem(): number;
        cpus(): any[];
        type(): string;
        release(): string;
        networkInterfaces(): { [index: string]: any };
        homedir(): string;
        userInfo(options?: { encoding: string }): {
            username: string;
            uid: number;
            gid: number;
            shell: string;
            homedir: string;
        };
        platform(): string;
        tmpDir(): string;
        tmpdir(): string;
        getNetworkInterfaces(): { [index: string]: any };
    };
    export = os;
}