import pymongo


class DBHandler(object):
	def __init__(self, *stuff):
		pass

	def close(self):
		pass

	def get_db(self):
		return pymongo.MongoClient('localhost', 27017).mapconquer_db

	def get_info(self, player):
		"""Returns None if player does not exist
		"""
		db = self.get_db().users
		return db.find_one({'name': player})

	def create_player(self, player):
		db = self.get_db().users
		db.insert({'name': player, 'xp': 1, 'faction': ''})
