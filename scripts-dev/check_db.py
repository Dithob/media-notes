import sqlite3

con = sqlite3.connect(r'C:\Users\wujue\.skills-manager\skills-manager.db')
con.row_factory = sqlite3.Row
cur = con.cursor()
rows = cur.execute("SELECT id, name, central_path, enabled, status FROM skills WHERE id='68ca0a72-2052-442d-b874-6701084c4059'").fetchall()
for r in rows:
    print('skills row:', dict(r))
rows2 = cur.execute("SELECT * FROM skill_targets WHERE skill_id='68ca0a72-2052-442d-b874-6701084c4059'").fetchall()
for r in rows2:
    print('target row:', dict(r))
print('--- any row named bibigpt/extract:')
for r in cur.execute("SELECT id, name, central_path, status, update_status FROM skills WHERE name LIKE '%bibigpt%' OR name LIKE '%extract%'").fetchall():
    print(dict(r))
print('--- total skills:', cur.execute('SELECT COUNT(*) FROM skills').fetchone()[0])
con.close()
