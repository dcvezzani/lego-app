#!/usr/bin/bash

if [[ ! -f database.sqlite ]]; then
    sqlite3 database.sqlite < db-init.sql
else
    echo "database.sqlite already exists; not creating a new one"
fi