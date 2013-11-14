from bottle import *
import atexit
import os.path

import db_handler


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

	# handle additional data
	action = request.query.action
	if action == "add_event":
		lon = request.query.lon
		lat = request.query.lat
		if len(lon) != 0 and len(lat) != 0:
			if not os.path.isfile('data/events.txt') or os.path.getsize('data/events.txt') == 0:
				with open('data/events.txt', 'w') as file:
					file.write('lat\tlon\ttitle\tdescription\ticon\ticonSize\ticonOffset\n')
			with open('data/events.txt', 'a') as file:
				file.write('%s\t%s\tNew Event\tMoop!\tdata/portal.png\t30,30\t0,-30\n\n' % (lat, lon))
			print "Added event"
		else:
			print "Invalid event addition query"
		return redirect("/?player=%s" % player)

	return template('html/game.html', {'name': info[0], 'xp': info[1], 'faction': info[2]})

@route('/<filename:path>')
def send_static(filename):
	return static_file(filename, root='.')

if __name__ == '__main__':
	run(server='flup', bindAddress= '/home/kpj/sock')