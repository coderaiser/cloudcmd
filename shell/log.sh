#!/bin/sh
if test -z $1
    then
        echo 'log.sh <tag>'
    else
        echo 'fix:'
        git log $1..HEAD --pretty=format:"- %s" --grep fix | sed  's/fix//g'
        echo '\n'
        
        echo 'feature:'
        git log $1..HEAD --pretty=format:"- %s" --grep feature | sed  's/feature//g'
        
        echo '\n\n'
fi
