const cp = require('child_process');
const path = require('path');

const _playerWindowsPath = path.join(__dirname, '..', 'players', 'playsound.exe');

export interface PlayerConfig {
    volume: number;
    deviceNumber: number;
}

export default {
    play(filePath: string, config: PlayerConfig) : Promise<void> {
        return new Promise ((resolve, reject) => {
            switch (process.platform) {
                case 'win32': 
                    cp.execFile(_playerWindowsPath, [filePath, config.volume / 100, config.deviceNumber]);
                    resolve();
                    break;
                case 'darwin':
                case 'linux': 
                default:
                    console.log('This platform (' + process.platform + ') is not supported');
                    return;
            }
        });
    },

    fetchDevicesList(callback: Function) : Promise<void> {
        return new Promise ((resolve, reject) => {
            switch (process.platform) {
                case 'win32': 
                    cp.execFile(
                        _playerWindowsPath,
                        ['--list-devices'],
                        async (err: Error | null, stdout: string) => {
                            if (err) return callback(err, []);

                            const items = stdout
                                .split('\n')
                                .map(line => line.trim())
                                .filter(Boolean)
                                .map(line => {
                                    const [index, ...nameParts] = line.split(':');
                                    return {
                                        label: nameParts.join(':').trim(),
                                        description: `Device ${index}`,
                                        index: Number(index)
                                    };
                                });

                            return callback(null, items);
                        }
                    );

                    resolve();
                    break;
                default:
                    console.log('Choosing audio devices is not supported on this platform (' + process.platform + ')');
            }
        });
    }
};

