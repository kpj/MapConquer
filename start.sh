cd ${0%/*}

if [ ! -d "mapconquer.env" ]; then
	./python/build_python.sh
fi

$(sleep 1; chmod 0666 /home/kpj/sock) & ./mapconquer.env/bin/python python/server.py
