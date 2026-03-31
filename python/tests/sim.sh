#!/bin/bash

TEST_SCRIPT=2-node-des.groovy

shopt -s nullglob
files=(tests/unet/unet-*)
shopt -u nullglob
DIR=${files[0]}

# Ensure Java is available: either JAVA_HOME or java on PATH
if [ -z "$JAVA_HOME" ] && ! command -v java >/dev/null 2>&1; then
  echo "No Java runtime found. Please ensure JDK8 is installed and either JAVA_HOME is set or 'java' is available on PATH for running the simulator."
  exit 1
fi

if [ "$1" == "start" ]; then
  "$DIR"/bin/unet tests/"$TEST_SCRIPT" > /dev/null 2>&1 &
fi

if [ "$1" == "stop" ]; then
  # First, try to gracefully terminate the processes
  for pid in $(pgrep -f "java.*unet"); do kill -15 "$pid" > /dev/null 2>&1; done
  # Wait for processes to exit
  sleep 5
  # Force kill any remaining processes
  for pid in $(pgrep -f "java.*unet"); do kill -9 "$pid" > /dev/null 2>&1; done
fi