#!/bin/bash
#@v Pattern Searching Helper
#@usage : pls search-icon
#@result :   mypath/source/_patterns/00-atoms/search-icon.mustache
#	Clickable in VSCode to open them
#@creator: Guillaume Isabelle
#2019-02-13

export cdir=$(pwd)
srcdir=$cdir/source
#echo "$srcdir"
du -a $srcdir | grep "$1"

