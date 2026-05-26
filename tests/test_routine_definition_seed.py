import asyncio

from app.db import seed_routine_definitions
from app.services.routines import ROUTINE_DEFINITION_CATALOG


class FakeRoutineDefinitions:
    def __init__(self):
        self.upserts = []

    async def update_one(self, query, update, upsert=False):
        self.upserts.append((query, update, upsert))


class FakeDb:
    def __init__(self):
        self.routine_definitions = FakeRoutineDefinitions()


def test_seed_routine_definitions_upserts_catalog():
    fake_db = FakeDb()

    asyncio.run(seed_routine_definitions(fake_db))

    assert len(fake_db.routine_definitions.upserts) == len(ROUTINE_DEFINITION_CATALOG)
    first_query, first_update, first_upsert = fake_db.routine_definitions.upserts[0]
    assert first_query == {"routine_id": ROUTINE_DEFINITION_CATALOG[0].routine_id}
    assert first_update["$set"]["title"] == ROUTINE_DEFINITION_CATALOG[0].title
    assert first_upsert is True
