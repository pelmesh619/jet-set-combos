import * as vscode from 'vscode';
import * as path from 'path';
import player, { PlayerConfig } from './player';
import debounce = require('lodash.debounce');
import { toInteger } from 'lodash';

let listener: EditorListener;

let config: PlayerConfig = {
    volume: 100,
    deviceNumber: -1
};

async function isActive() : Promise<boolean> {
    return Boolean(await vscode.workspace.getConfiguration('jet-set-combos').get('enable'));
}

export async function activate(context: vscode.ExtensionContext) {
    console.log('[Jet Set Combos] Starting up Jet Set Combos');

    config.volume = await vscode.workspace.getConfiguration('jet-set-combos').get('volume') || 100;
    config.deviceNumber = await vscode.workspace.getConfiguration('jet-set-combos').get('enable') || -1;

    listener = listener || new EditorListener(player);

    vscode.commands.registerCommand('jet-set-combos.enable', async () => {
        if (!await isActive()) {
            await vscode.workspace.getConfiguration('jet-set-combos').update('enable', true, true);
            vscode.window.showInformationMessage('[Jet Set Combos] Combos are enabled');
        } else {
            vscode.window.showWarningMessage('[Jet Set Combos] Combos was already enabled');
        }
    });

    vscode.commands.registerCommand('jet-set-combos.disable', async () => {
        if (await isActive()) {
            await vscode.workspace.getConfiguration('jet-set-combos').update('enable', false, true);
            vscode.window.showInformationMessage('[Jet Set Combos] Combos are disabled');
        } else {
            vscode.window.showWarningMessage('[Jet Set Combos] Combos was already disabled');
        }
    });

    vscode.commands.registerCommand('jet-set-combos.volumeUp', incrementVolume);
    vscode.commands.registerCommand('jet-set-combos.volumeDown', decrementVolume);
    vscode.commands.registerCommand('jet-set-combos.setVolume', setVolume);
    vscode.commands.registerCommand('jet-set-combos.selectAudioDevice', selectAudioDevice);

    context.subscriptions.push(listener);
}

export function deactivate() { }

async function incrementVolume() {
    config.volume += 10;

    if (config.volume === 110) {
        vscode.window.showWarningMessage('[Jet Set Combos] Combos are already at maximum volume');
        config.volume = 100;
    }

    vscode.window.showInformationMessage('[Jet Set Combos] Volume was raised to ' + config.volume);
    await vscode.workspace.getConfiguration('jet-set-combos').update('volume', config.volume, true);
}

async function decrementVolume() {
    config.volume += 10;

    if (config.volume === 110) {
        vscode.window.showWarningMessage('[Jet Set Combos] Combos are already at maximum volume');
        config.volume = 100;
    }

    vscode.window.showInformationMessage('[Jet Set Combos] Volume was raised to ' + config.volume);
    await vscode.workspace.getConfiguration('jet-set-combos').update('volume', config.volume, true);
}

async function setVolume() {
    let input = await vscode.window.showInputBox();
    let newVolume = toInteger(input);

    if (newVolume >= 100) {
        vscode.window.showInformationMessage("[Jet Set Combos] Volume is increased to maximum")
        config.volume = 100;
    }
    else if (newVolume <= 1) {
        vscode.window.showInformationMessage("[Jet Set Combos] Volume is decreased to minimum")
        config.volume = 1;
    } else {
        if (config.volume < newVolume)
            vscode.window.showInformationMessage("[Jet Set Combos] Volume is increased to " + newVolume)
        else if (config.volume > newVolume)
            vscode.window.showInformationMessage("[Jet Set Combos] Volume is decreased to " + newVolume)
        else
            vscode.window.showInformationMessage("[Jet Set Combos] Volume is already at " + newVolume);

        config.volume = newVolume;
    }

    await vscode.workspace.getConfiguration('jet-set-combos').update('volume', config.volume, true);
}

export class EditorListener {
    private _soundDirectory: string = path.join(__dirname, '..', 'sounds');

    private _combo1: string      = path.join(this._soundDirectory, 'e_s004.wav');
    private _combo2: string      = path.join(this._soundDirectory, 'e_s005.wav');
    private _combo3: string      = path.join(this._soundDirectory, 'e_s006.wav');
    private _combo4: string      = path.join(this._soundDirectory, 'e_s007.wav');
    private _combo5: string      = path.join(this._soundDirectory, 'e_s008.wav');
    private _combo6: string      = path.join(this._soundDirectory, 'e_s009.wav');
    private _comboSuper: string  = path.join(this._soundDirectory, 'e_s012.wav');
    private _comboSuper2: string = path.join(this._soundDirectory, 'e_s013.wav');

    private _tapeRolling: string  = path.join(this._soundDirectory, 'e_s003.wav');
    private _tapeRolling2: string = path.join(this._soundDirectory, 'e_s010.wav');

    private _comboCount: number = 0;
    private _comboPlayed: number = 0;
    private _comboTimer: NodeJS.Timeout | undefined;
    private play: Function;

    constructor(private player: any) {
        vscode.workspace.onDidChangeTextDocument(this._keystrokeCallback, this, []);
        this.play = (path: string) => player.play(path, config);
    }

    _keystrokeCallback = debounce(async (event: vscode.TextDocumentChangeEvent) => {
        let extensionConfig = await vscode.workspace.getConfiguration('jet-set-combos');

        config.volume = extensionConfig.get('volume') || 100;
        config.deviceNumber = extensionConfig.get('audioDevice') || 100;

        if (!extensionConfig.get('enable')) {
            return;
        }

        let activeDocument = vscode.window.activeTextEditor && vscode.window.activeTextEditor.document;
        if (event.document !== activeDocument || event.contentChanges.length === 0) {
            return;
        }

        let pressedKey = event.contentChanges[0].text;

        if (pressedKey === '' && event.contentChanges[0].rangeLength > 2) {
            // text was cut
            if (!extensionConfig.get('disableCutSFX')) {
                this.play(this._tapeRolling2);
            }
            return;
        } else if (pressedKey === '') {
            // delete or backspace
            return;
        }

        let textLength = pressedKey.trim().length;

        if (textLength >= 10) {
            // text was pasted
            if (!extensionConfig.get('disablePasteSFX')) {
                this.play(this._tapeRolling);
            }
            return;
        }

        this._comboCount += 1;

        if (this._comboTimer) clearTimeout(this._comboTimer);
        this._comboTimer = setTimeout(() => {
            this._comboCount = 0;
            this._comboPlayed = 0;
        }, 1500);

        if (this._comboCount >= 50 && this._comboPlayed == 7) {
            this.play(this._comboSuper);
            this._comboPlayed += 1;
        } else if (this._comboCount >= 40 && this._comboPlayed == 6) {
            this.play(this._comboSuper2);
            this._comboPlayed += 1;
        } else if (this._comboCount >= 35 && this._comboPlayed == 5) {
            this.play(this._combo6);
            this._comboPlayed += 1;
        } else if (this._comboCount >= 29 && this._comboPlayed == 4) {
            this.play(this._combo5);
            this._comboPlayed += 1;
        } else if (this._comboCount >= 23 && this._comboPlayed == 3) {
            this.play(this._combo4);
            this._comboPlayed += 1;
        } else if (this._comboCount >= 17 && this._comboPlayed == 2) {
            this.play(this._combo3);
            this._comboPlayed += 1;
        } else if (this._comboCount >= 11 && this._comboPlayed == 1) {
            this.play(this._combo2);
            this._comboPlayed += 1;
        } else if (this._comboCount >= 5 && this._comboPlayed == 0) {
            this.play(this._combo1);
            this._comboPlayed += 1;
        }
    }, 30, { leading: true });

    dispose() { }
}


interface AudioDevicePick extends vscode.QuickPickItem {
	index: number;
}

async function selectAudioDevice() {
    if (process.platform !== 'win32') {
        vscode.window.showErrorMessage('[Jet Set Combos] Choosing between audio devices is available only on Windows');
        return;
    }
    player.fetchDevicesList(
        async (err: Error | null, items: [AudioDevicePick]) => {
            if (err) {
                console.log(err);
                vscode.window.showErrorMessage('[Jet Set Combos] Failed to list audio devices');
                return;
            }

            const picked = await vscode.window.showQuickPick(
                [
                    {
                        label: 'Default device',
                        description: '',
                        index: Number(-1)
                    }, 
                    ...items
                ], 
                {
                    "placeHolder": "Select audio output device"
                }
            );

            if (!picked) return;

            await vscode.workspace
                .getConfiguration('jet-set-combos')
                .update('audioDevice', picked.index, vscode.ConfigurationTarget.Global);

            config.deviceNumber = picked.index;

            vscode.window.showInformationMessage(
                `[Jet Set Combos] Audio device set to "${picked.label}"`
            );
        }
    );
}
