import sqlite3

con = sqlite3.connect(r'C:\Users\wujue\.skills-manager\skills-manager.db')
con.row_factory = sqlite3.Row
cur = con.cursor()
for r in cur.execute("SELECT * FROM audit_log ORDER BY ts DESC LIMIT 15").fetchall():
    print(dict(r))
con.close()
