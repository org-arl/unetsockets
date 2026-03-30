#!/bin/bash

TEST_SCRIPT=2-node-des.groovy

# Check if JAVA_HOME is set and java is available
# if not, exit with an error message
if [ -z "$JAVA_HOME" ] || ! command -v java &> /dev/null; then
  echo "Error: JAVA_HOME is not set or java is not available in PATH."
  exit 1
fi

pattern="tests/unet/unet-*"
files=($pattern)
DIR=${files[0]}

if [ "$1" == "start" ]; then
  "$DIR"/bin/unet tests/"$TEST_SCRIPT" > /dev/null 2>&1 &
fi

if [ "$1" == "stop" ]; then
  for pid in $(pgrep -f "java.*unet"); do kill -9 $pid > /dev/null 2>&1; done
fi