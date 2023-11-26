import argparse
import logging
from websocket_server import WebsocketServer
import serial
import threading
from aprspy import APRS, PositionPacket, MessagePacket, StatusPacket, BeaconPacket, ParseError, UnsupportedError
import json
from datetime import datetime

recent_packet = threading.Event()

def share_packet(server, packet, raw):
    p = {
        "source": packet.source,
        "symbol_id": packet.symbol_id,
        "symbol_table": packet.symbol_table,
        #"timestamp": packet.timestamp
        "raw": raw,
    }

    if isinstance(packet, PositionPacket):
        p["type"] = "position"
        p["latitude"] = packet.latitude
        p["longitude"] = packet.longitude
        p["comment"] = packet.comment

    if isinstance(packet, MessagePacket):
        p["type"] = "message"
        p["message"] = packet.message
        p["info"] = packet.info

    if isinstance(packet, StatusPacket):
        p["type"] = "status"
        p["status_message"] = packet.status_message

    if isinstance(packet, BeaconPacket):
        p["type"] = "beacon"
        p["comment"] = packet.comment

    server.send_message_to_all(json.dumps(p))

def serial_handle(serialport, server):
    global recent_packet

    ser = serial.Serial(serialport)
    while True:
        try:
            line = ser.read_until(b'\r').strip().decode("ascii")
        except UnicodeDecodeError:
            print("Malformed line")

        if not line.startswith("$") and len(line)>0:
            try:
                packet = APRS.parse(line)
                share_packet(server, packet, line)
                recent_packet.set()
            except ParseError:
                print("parseerror", line)
            except UnsupportedError:
                print("unsupported", line)
            except BrokenPipeError:
                print("Broken pipe when sending packet")
            except:
                print("Library failure", line)
            
        if line.startswith("$"):
            try:
                server.send_message_to_all(json.dumps({'type':'gps', 'raw':line}))
            except BrokenPipeError:
                print("Broken pipe when sending GPS update")

def watchdog_handle(server):
    global recent_packet

    # start optimistically
    recent_packet.set()
    while True:
        if not recent_packet.is_set():
            server.shutdown_gracefully()

        recent_packet.clear()
        time.sleep(30)
        # serial handler has 30s to set this to true



parser = argparse.ArgumentParser(
    prog = "aprs",
    description = "APRS messages to web socket"
)

parser.add_argument('serialport')
args = parser.parse_args()

server = WebsocketServer(host='0.0.0.0', port=13254, loglevel=logging.INFO)
#server.set_fn_new_client(new_client)

serial_thread = threading.Thread(target=serial_handle, args=(args.serialport, server,))
serial_thread.start()

watchdog_thread = threading.Thread(target=watchdog_handle, args=(server, ))
watchdog_thread.start()

server.run_forever()
