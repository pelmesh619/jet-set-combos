const cp = require('child_process');
const path = require('path');

const _playerWindowsPath = path.join(__dirname, '..', 'players', 'playsound.exe');

export interface PlayerConfig {
    volume: number;
    deviceNumber: number;
}

export default {
    play(filePath: string, config: PlayerConfig) : Promise<void> {
        return new Promise((resolve) => {
            switch (process.platform) {
                case 'win32': {
                    console.log(_playerWindowsPath, [filePath, config.volume / 100, config.deviceNumber])
                    const child = cp.spawn(_playerWindowsPath, [filePath, config.volume / 100, config.deviceNumber]);

                    child.on('error', (err: Error) => {
                        console.log('[Jet Set Combos] Failed to play sound via playsound.exe:', err.message);
                    });
                    resolve();
                    break;
                }
                case 'darwin': {
                    const volume = Math.max(0, Math.min(100, config.volume || 100)) / 100;
                    const child = cp.spawn('afplay', ['-v', volume.toString(), filePath]);

                    child.on('error', (err: Error) => {
                        console.log('[Jet Set Combos] Failed to play sound via afplay:', err.message);
                    });

                    resolve();
                    break;
                }
                case 'linux': {
                    const safeVolume = Math.max(0, Math.min(100, config.volume || 100));
                    const pulseVolume = Math.round((safeVolume / 100) * 65536);
                    const args = [`--volume=${pulseVolume}`, filePath];
                    const child = cp.spawn('paplay', args);

                    child.on('error', (err: Error) => {
                        console.log('[Jet Set Combos] Failed to play sound via paplay:', err.message);
                    });

                    resolve();
                    break;
                }
                default: {
                    console.log('This platform (' + process.platform + ') is not supported');
                    resolve();
                    break;
                }
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

