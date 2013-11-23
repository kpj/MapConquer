from bottle import *
import atexit
import os.path
import collections
import time
import threading

import db_handler


# variables
connected_players = collections.defaultdict(dict)

# init
def shutdown():
	db.close()
	print "Goodbye!"
atexit.register(shutdown)

# handle database access
db = db_handler.DBHandler('data/data.db')

# handle webserver
@route('/')
def route_to_index():
	player = request.query.player
	if len(player) == 0:
		return static_file("html/login.html", root=".")

	info = db.get_info(player)
	if info == None:
		db.create_player(player)
		info = db.get_info(player)

	return template('html/game.html', {'name': info['name'], 'xp': info['xp'], 'faction': info['faction']})

@route('/<filename:path>')
def send_static(filename):
	return static_file(filename, root='.')

@route('/postdata', method='POST')
def postData():
	data = request.json['data']

	action = data['action']
	if action == "add_event":
		lon = data['lon']
		lat = data['lat']
		if not os.path.isfile('data/events.txt') or os.path.getsize('data/events.txt') == 0:
			with open('data/events.txt', 'w') as file:
				file.write('lat\tlon\ttitle\tdescription\ticon\ticonSize\ticonOffset\n')
		with open('data/events.txt', 'a') as file:
			file.write('%s\t%s\tMarker\tPlaced by %s (%s)!\tdata/portal.png\t30,30\t0,-30\n\n' % (lat, lon, data['owner'], data['faction']))
		print "Added event"
		return {"status": "success"}
	elif action == "get_info":
		handle_poll(data['name'])

		typ = data['type']
		if typ == 'player':
			res = db.get_info(data['name'])
			res.pop('_id', None)
			return res
		elif typ == 'other_players':
			return {"type": "other_players", "data": connected_players}
	elif action == "pos_update":
		connected_players[data['name']]['position'] = data['position']
		return {"status": "success"}

	return {"status": "failure"}

# handle game
def handle_poll(name):
	if not 'last_poll' in connected_players[name]:
		print "Connect: %s" % name

	connected_players[name]['last_poll'] = time.time()

def check_player_status():
	while True:
		cur = time.time()

		delme = []
		for key, val in connected_players.iteritems():
			if cur - val['last_poll'] > 10:
				delme.append(key)
		for name in delme:
			print "Disconnect: %s" % name
			connected_players.pop(name, None)
			

		time.sleep(10)

if __name__ == '__main__':
	thread = threading.Thread(target = check_player_status)
	thread.start()

	run(server='flup', bindAddress= '/home/kpj/sock')
