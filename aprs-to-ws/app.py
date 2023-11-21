import argparse
import logging
from websocket_server import WebsocketServer
import serial
import threading
from aprspy import APRS, PositionPacket, MessagePacket, StatusPacket, BeaconPacket, ParseError, UnsupportedError
import json



def share_packet(server, packet, raw):
        print(type(packet), packet)
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

        print(p)
        server.send_message_to_all(json.dumps(p))

def serial_handle(serialport, server):
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
                        except ParseError:
                                print("parseerror", line)
                        except UnsupportedError:
                                print("unsupported", line)
                        except:
                                print("Library failure", line)
                if line.startswith("$"):
                        server.send_message_to_all(json.dumps({'type':'gps', 'raw':line}))


parser = argparse.ArgumentParser(
    prog = "aprs",
    description = "APRS messages to web socket"
)

parser.add_argument('serialport')

args = parser.parse_args()


server = WebsocketServer(host='0.0.0.0', port=13254, loglevel=logging.INFO)
#server.set_fn_new_client(new_client)


x = threading.Thread(target=serial_handle, args=(args.serialport, server,))
x.start()

server.run_forever()
