import os.path
import sqlite3 as sql

class DBHandler(object):
	def __init__(self, path):
		self.path = path

		self.connect()
		# check validity of database
		if os.path.getsize(path) == 0: # TODO: make this better
			c = self.db.cursor()
			c.execute('CREATE TABLE "Players" ("Name" TEXT NOT NULL, "XP" INTEGER NOT NULL DEFAULT (0), "Faction" TEXT)')
			self.db.commit()
		self.close()

	def connect(self):
		self.db = sql.connect(self.path)

	def close(self):
		#self.db.close()
		pass

	def get_info(self, player):
		"""Returns None if player does not exist
		"""
		self.connect()
		c = self.db.cursor()
		c.execute('SELECT * FROM players WHERE players.Name = "%s"' % player)
		res = c.fetchone()
		self.close()
		return res

	def create_player(self, player):
		self.connect()
		c = self.db.cursor()
		c.execute('INSERT INTO players VALUES ("%s", "0", "")' % player)
		self.db.commit()
		self.close()
