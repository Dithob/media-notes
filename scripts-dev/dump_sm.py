import sqlite3, json

con = sqlite3.connect(r'C:\Users\wujue\.skills-manager\skills-manager.db')
con.row_factory = sqlite3.Row
cur = con.cursor()

print('=== TABLES ===')
for row in cur.execute("SELECT name, sql FROM sqlite_master WHERE type='table'").fetchall():
    print('TABLE', row['name'])
    print(row['sql'])
    print()

print('=== skill row (bibigpt) ===')
b = cur.execute("SELECT * FROM skills WHERE name='bibigpt-account-registration'").fetchone()
print(dict(b) if b else None)

print()
print('=== all tables rows mentioning bibigpt ===')
for (tname,) in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall():
    try:
        cols = [c[1] for c in cur.execute(f'PRAGMA table_info({tname})').fetchall()]
        if any('skill' in c.lower() or 'name' in c.lower() for c in cols):
            # find matching rows
            for row in cur.execute(f'SELECT * FROM {tname}').fetchall():
                d = dict(row)
                blob = json.dumps(d, ensure_ascii=False)
                if 'bibigpt' in blob.lower() or '68ca0a72' in blob:
                    print(f'-- {tname}: {blob[:600]}')
    except Exception as e:
        print(f'!! {tname}: {e}')
