// Test:  017564 039450000000
// https://github.com/Milesight-IoT/SensorDecoders/tree/main/EM_Series/EM500_Series/EM500-LGT

function parseUplink(device, payload) {

    var payloadb = payload.asBytes();
    var decoded = Decoder(payloadb, payload.port)
    env.log(decoded);

    // Store battery
    if (decoded.battery != null) {
        var sensor1 = device.endpoints.byAddress("1");

        if (sensor1 != null)
            sensor1.updateVoltageSensorStatus(decoded.battery);
    };

    // Store light
    if (decoded.illumination != null) {
        var sensor2 = device.endpoints.byAddress("2");

        if (sensor2 != null)
            sensor2.updateLightSensorStatus(decoded.illumination);
    };
}

/**
 * Payload Decoder for The Things Network
 *
 * Copyright 2023 Milesight IoT
 *
 * @product EM500-LGT
 */
function Decoder(bytes, port) {
    return milesight(bytes);
}

function milesight(bytes) {
    var decoded = {};

    for (var i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];
        // BATTERY
        if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = bytes[i];
            i += 1;
        }
        // LIGHT
        else if (channel_id === 0x03 && channel_type === 0x94) {
            decoded.illumination = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // HISTORY DATA
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var point = {};
            point.timestamp = readUInt32LE(bytes.slice(i, i + 4));
            point.illumination = readUInt32LE(bytes.slice(i + 4, i + 8));

            decoded.history = decoded.history || [];
            decoded.history.push(point);
            i += 8;
        } else {
            break;
        }
    }

    return decoded;
}

/* ******************************************
 * bytes to number
 ********************************************/
function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readInt16LE(bytes) {
    var ref = readUInt16LE(bytes);
    return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xffffffff) >>> 0;
}

function readInt32LE(bytes) {
    var ref = readUInt32LE(bytes);
    return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}