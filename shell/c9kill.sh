#!/bin/sh
kill -9 `ps ax|grep node-openshift|grep -v grep|awk '{print $1}'`
# print finded process
ProcessList=`ps ax|grep node-openshift`
echo $ProcessList
# getting pid of process
PID=`echo "${ProcessList}"|grep -v grep|awk '{print $1}'`
echo $PID
#kill it
if test ! $PID
then echo 'process not found'
else kill -9 $PID && echo 'killed process'
fi