# Jet Set Combos

Jet Set Combos🚀 is a Visual Studio Code extension that plays combo sound effects from the 2000 game *Jet Set Radio* when you type code continuously🤟🤟🤟

> [!NOTE]
> This extension is currently supported only on **Windows (x86-64)**  
> However you can build it by yourself, check build section

## Features

When you type very fast, you get combo sounds and stylish 🎵sound effects🎵

### Commands

You can control the extension using the following commands:

- Enable / Disable the extension  
    `> Enable Jet Set Radio Combos`  
    `> Disable Jet Set Radio Combos`

- Increase volume by 10  
    `> Increase volume by 10`

- Decrease volume by 10  
    `> Decrease volume by 10`

- Set a specific volume value  
    `> Set volume to a specific value (1–100)`

- Select audio output device *(Windows only)*  
    `> Select Audio Device`

## Requirements

- **Windows 10 or newer**  
    The required sound player is bundled with the extension

## Extension Settings

This extension contributes the following settings:

- `jet-set-combos.enable`  
    Enable or disable the extension

- `jet-set-combos.volume`  
    Volume level from **1 to 100**, where 1 is very quiet and 100 is loud

- `jet-set-combos.audioDevice` *(Windows only)*  
    Audio output device index (can be selected via the command palette)

- `jet-set-combos.disablePasteSFX`  
    Disable the tape-rolling sound when pasting text

- `jet-set-combos.disableCutSFX`  
    Disable the tape-rolling sound when cutting text

## Known Issues

There are currently no known issues (be the first to discover one!)

## Build

Make sure the following tools are installed:

- Node.js (18.x or newer recommended)
    <https://nodejs.org/>

- .NET SDK 7.0 or newer for the sound player  
    <https://dotnet.microsoft.com/download>

1. Clone this repository

    ```bash
    git clone https://github.com/pelmesh619/jet-set-combos.git
    cd jet-set-combos
    ```

2. Install Node.js dependencies

    ```bash
    npm install
    ```

3. Build the sound player

    ```bash
    dotnet publish ./playsound/ -c Release --sc -o ./players
    ```

4. Build the extension

    ```bash
    vsce package
    ```

Now you got a .vsix file that you can install in Visual Studio Code's extensions tab or with a command:

```bash
code --install-extension jet-set-combos-0.1.0.vsix
```
## Release Notes

### 0.1.0

- Initial beta release of Jet Set Combos
