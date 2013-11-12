from bottle import *

@route('/<filename:path>')
def send_static(filename):
    return static_file(filename, root='.')

run(host='localhost', port=8080)
