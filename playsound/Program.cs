using System;
using System.Text;
using System.Globalization;
using System.Threading;
using NAudio.Wave;
using NAudio.CoreAudioApi;

class Program
{
    static int Main(string[] args)
    {
        Console.OutputEncoding = Encoding.UTF8;
        Console.InputEncoding = Encoding.UTF8;
        // List audio devices
        if (args.Length == 1 && args[0] == "--list-devices")
        {
            ListDevices();
            return 0;
        }

        if (args.Length < 1)
        {
            PrintUsage();
            return 1;
        }

        string filePath = args[0];
        float volume = args.Length > 1 ? ParseVolume(args[1]) : 1.0f;
        int deviceIndex = args.Length > 2 ? int.Parse(args[2]) : -1;

        try
        {
            PlaySound(filePath, volume, deviceIndex);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine("Audio error: " + ex.Message);
            return 2;
        }

        return 0;
    }

    static void PlaySound(string filePath, float volume, int deviceIndex)
    {
        using var reader = new AudioFileReader(filePath)
        {
            Volume = Math.Clamp(volume, 0f, 1f)
        };

        using var output = new WasapiOut(
            GetDevice(deviceIndex),
            AudioClientShareMode.Shared,
            false,
            20
        );

        output.Init(reader);
        output.Play();

        while (output.PlaybackState == PlaybackState.Playing)
        {
            Thread.Sleep(5);
        }
    }

    static MMDevice GetDevice(int index)
    {
        var enumerator = new MMDeviceEnumerator();
        var devices = enumerator.EnumerateAudioEndPoints(DataFlow.Render, DeviceState.Active);

        if (index < 0 || index >= devices.Count)
            return enumerator.GetDefaultAudioEndpoint(DataFlow.Render, Role.Multimedia);

        return devices[index];
    }

    static void ListDevices()
    {
        var enumerator = new MMDeviceEnumerator();
        var devices = enumerator.EnumerateAudioEndPoints(DataFlow.Render, DeviceState.Active);

        for (int i = 0; i < devices.Count; i++)
        {
            Console.WriteLine($"{i}: {devices[i].FriendlyName}");
        }
    }

    static float ParseVolume(string value)
    {
        if (float.TryParse(
            value,
            NumberStyles.Float,
            CultureInfo.InvariantCulture,
            out float v))
        {
            return Math.Clamp(v, 0f, 1f);
        }
        return 1.0f;
    }

    static void PrintUsage()
    {
        Console.WriteLine("Usage:");
        Console.WriteLine("  playsound <file> [volume 0.0–1.0] [deviceIndex]");
        Console.WriteLine("  playsound --list-devices");
    }
}
