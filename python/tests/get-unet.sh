#!/bin/bash

# Downloads and sets up UnetStack for testing unetpy.

UNET_URL=https://unetstack.net/downloads/unet-community-3.1.0.tgz

if [ ! -d "tests/unet" ]; then
    mkdir -p tests/unet
    wget -P tests/unet/ "$UNET_URL"
    tar -C tests/unet/ -xvzf tests/unet/unet-community*.tgz
    rm tests/unet/unet-community*.tgz
fi

