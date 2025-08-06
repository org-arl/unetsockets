#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# txdata.py - Transmit data using UnetSocket

from unetpy import *
import sys
import argparse

ip = 'localhost'
port = 1100
address = 0
data = [1,2,3,4,5,6,7]

parser = argparse.ArgumentParser(
	description="Transmit data using UnetSocket.",
	epilog="Example: txdata.py 192.168.1.20 5 1100"
)
parser.add_argument("ip", help="IP address of the transmitter modem")
parser.add_argument("node_address", type=int, help="Node address of the receiver modem (use 0 for broadcast)")
parser.add_argument("port", nargs="?", type=int, default=1100, help="Port number of transmitter modem (default: 1100)")

args = parser.parse_args()

ip = args.ip
address = args.node_address
port = args.port

# Connect to the Unet instance
print(f"Connecting to {ip}:{port}")
sock = UnetSocket(ip, port)
if ( sock == None ):
	print(f"Couldn't open UnetSocket to {ip}:{port}")
	sys.exit()

# Transmit data
print(f"Transmitting {len(data)} bytes of data to {address}")
sock.send(data, address, Protocol.DATA);

# Close the UnetSocket
sock.close()

print("Transmission Complete")
