from websocket_server import WebsocketServer
import time
import argparse
import logging
import threading

parser = argparse.ArgumentParser(
    prog = "aprs",
    description = "APRS messages simulator"
)

parser.add_argument('jsonl')
parser.add_argument("--interval", type=float, default=0.01)

args = parser.parse_args()


def sender_handle(server):
    lines = open(args.jsonl).readlines()
    while True:
        server.send_message_to_all(lines[0])
        lines = lines[1:] + [lines[0]]
        time.sleep(args.interval)
    
server = WebsocketServer(host='0.0.0.0', port=13254, loglevel=logging.INFO)

sender_thread = threading.Thread(target=sender_handle, args=(server,))
sender_thread.start()

server.run_forever()