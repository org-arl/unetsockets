#!/bin/bash

TEST_SCRIPT=2-node-des.groovy

pattern="tests/unet/unet-*"
files=($pattern)
DIR=${files[0]}

if [ "$1" == "start" ]; then
  "$DIR"/bin/unet tests/"$TEST_SCRIPT" > /dev/null 2>&1 &
fi

if [ "$1" == "stop" ]; then
  # First, try to gracefully terminate the processes
  for pid in $(pgrep -f "java.*unet"); do kill -15 $pid > /dev/null 2>&1; done
  # Wait for processes to exit
  sleep 5
  # Force kill any remaining processes
  for pid in $(pgrep -f "java.*unet"); do kill -9 $pid > /dev/null 2>&1; done
fi