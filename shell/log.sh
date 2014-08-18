#!/bin/sh
if test -z $1
    then
        echo 'log.sh <tag>'
    else
        FIX=`git log $1..HEAD --pretty=format:"- %s" --grep fix | sed  's/fix//g'`
        
        if test -n FIX
        then
            echo 'fix:'
            git log $1..HEAD --pretty=format:"- %s" --grep feature | sed  's/feature//g'
        fi
        
        FEATURE=$(git log $1..HEAD --pretty=format:"- %s" --grep feature | sed  's/feature//g')
        
        if test -n FEATURE
        then
            echo 'feature:'
            git log $1..HEAD --pretty=format:"- %s" --grep feature | sed  's/feature//g'
        fi
        
        if test -n FIX || test -z FEATURE
        then
            echo '\n'
        fi
fi
