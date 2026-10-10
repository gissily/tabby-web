#!/bin/sh
if [ -n "$DOCKERIZE_ARGS" ]; then
    dockerize $DOCKERIZE_ARGS
fi
cd /app
/app/venv/bin/python ./manage.py $@
