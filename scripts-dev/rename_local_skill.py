import sqlite3, re, pathlib, time

db = pathlib.Path(r'C:\Users\wujue\.skills-manager\skills-manager.db')
new_dir = pathlib.Path(r'C:\Users\wujue\.skills-manager\skills\extract-tool-registration')
skill_md = new_dir / 'SKILL.md'
text = skill_md.read_text(encoding='utf-8')

m = re.match(r'^---\n(.*?)\n---\n', text, re.DOTALL)
assert m, 'no frontmatter'
fm = m.group(1)
name = re.search(r'^name:\s*(.+)$', fm, re.M).group(1).strip()
desc = re.search(r'^description:\s*>\s*\n(.*?)\n---', text, re.DOTALL).group(1) if False else None
# description: parse folded block
lines = fm.splitlines()
idx = next(i for i, l in enumerate(lines) if l.startswith('description:'))
parts = [l.strip() for l in lines[idx+1:] if l.strip() and not l.startswith('name:')]
desc = ' '.join(parts)
print('parsed name:', name)
print('parsed desc:', desc[:120], '...')

con = sqlite3.connect(db)
cur = con.cursor()
row = cur.execute("SELECT id, name, central_path FROM skills WHERE name='bibigpt-account-registration'").fetchone()
assert row, 'old row not found'
sid, old_name, old_path = row
print('old row:', sid, old_name, old_path)

now = int(time.time() * 1000)
try:
    cur.execute("UPDATE skills SET name=?, description=?, central_path=?, content_hash=NULL, updated_at=? WHERE id=?",
                (name, desc, str(new_dir), now, sid))
    cur.execute(
        "INSERT INTO audit_log (ts, action, skill_id, skill_name, tool, success, detail) VALUES (?,?,?,?,?,?,?)",
        (now, 'rename', sid, name, None, 1,
         f'renamed from {old_name} (manual, via pi session)'))
    con.commit()
    print('DB updated ok')
finally:
    con.close()
