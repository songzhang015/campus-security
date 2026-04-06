from database.Connection import Connection
import json
import os

class IncidentsRepository(Connection):
    def __init__(self):
        super().__init__()
