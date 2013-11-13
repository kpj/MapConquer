import os.path
import sqlite3 as sql

class DBHandler(object):
	def __init__(self, path):
		self.db = sql.connect(path)

		# check validity of database
		if os.path.getsize(path) == 0: # TODO: make this better
			c = self.db.cursor()
			c.execute('CREATE TABLE "Players" ("Name" TEXT NOT NULL, "XP" INTEGER NOT NULL DEFAULT (0), "Faction" TEXT)')
			self.db.commit()

	def close(self):
		self.db.close()

	def get_info(self, player):
		"""Returns None if player does not exist
		"""
		c = self.db.cursor()
		c.execute('SELECT * FROM players WHERE players.Name = "%s"' % player)
		return c.fetchone()

	def create_player(self, player):
		c = self.db.cursor()
		c.execute('INSERT INTO players VALUES ("%s", "0", "")' % player)
		self.db.commit()
