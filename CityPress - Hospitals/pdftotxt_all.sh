#!/bin/sh
for f in feedback_report/*.pdf
do
	# echo $f
	filename=$(basename "$f")
	extension="${filename##*.}"
	filename="${filename%.*}"
	echo $filename
	pdftotext -layout $f txt/$filename.txt
done