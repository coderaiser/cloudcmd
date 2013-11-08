#!/bin/sh
if test -z $1
    then
        echo "log.sh <tag>"
    else
        git log $1..HEAD --pretty=format:"- %s" --grep feature
        git log $1..HEAD --pretty=format:"- %s" --grep fix
        git log $1..HEAD --pretty=format:"- %s" --grep refactor
fi