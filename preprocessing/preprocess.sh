#!/usr/bin/env bash

cd "$(dirname "$0")"

./preprocess.js < raw-data.csv > ../source/data.json
