#!/bin/sh

## Port that the node api app runs on
export PORT=3000


## DO NOT CHANGE -- Flag that will let you run the test Makefile.  This was done so that you
export TEST_MODE=test_mode_is_enabled



## save the log on test.log
LOG_FILE=test.log
node server.js > $LOG_FILE 2>&1 &

## Grab PID of background process
NODE_PID=$!
echo "Node.js app launching on PID: ${NODE_PID}.  Starting tests in 3 seconds.  Log files for the Node.js app are logged to $LOG_FILE"

## Give about 3 sec for the node process to completely startup
sleep 3

make test

## Kill background node process
kill $NODE_PID