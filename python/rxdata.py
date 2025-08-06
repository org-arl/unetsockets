#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# rxdata.py - Receive data using UnetSocket

from unetpy import *
import sys
import argparse

ip = 'localhost'
port = 1100

parser = argparse.ArgumentParser(description='Receive data using UnetSocket.')
parser.add_argument('ip', help='IP address of the receiver modem')
parser.add_argument('port', nargs='?', type=int, default=1100, help='Port number of receiver modem (default: 1100)')
args = parser.parse_args()

ip = args.ip
port = args.port

# Connect to the Unet instance
print(f"Connecting to {ip}:{port}")
sock = UnetSocket(ip, port)
if ( sock == None ):
	print(f"Couldn't open UnetSocket to {ip}:{port}");
	sys.exit();

# Bind to protocol DATA
if (not sock.bind(Protocol.DATA)):
	print(f"Couldn't bind the UnetSocket to protocol #{Protocol.DATA}");
	sys.exit();

# Set a timeout of 10 seconds
sock.setTimeout(10000)

# Receive and display data
print("Waiting for a Datagram...");

ntf = sock.receive()

if (ntf != None):
	print(ntf)
else:
	print("No Datagram received!");

# Close the UnetSocket
sock.close()