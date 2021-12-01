
import { jsonSchema } from '../../src';

type DeviceLogsFilter = DeviceLogFilterLog | DeviceLogFilterGeneric;

enum DeviceLogType {
    Info = 'info',
    Health = 'health',
    Log = 'log'
}

enum DeviceLogLevel {
    Debug = 20,
    Info = 30,
    Warn = 40,
    Error = 50,
    Fatal = 60
}

interface DeviceLogFilterLog extends DeviceLogFilterBase {
    type: DeviceLogType.Log;
    level?: {
        start?: DeviceLogLevel | number;
        end?: DeviceLogLevel | number;
    };
}
interface DeviceLogFilterGeneric extends DeviceLogFilterBase {
    type?: DeviceLogType.Info | DeviceLogType.Health;
}

type Id = `${string}-${string}-${string}-${string}-${string}`;

interface DeviceLogFilterBase {
    deviceIds?: [Id, ...Id[]] | null;
    created?: {
        after?: number;
        before?: number;
    };
}

const _ = jsonSchema<DeviceLogsFilter>();
