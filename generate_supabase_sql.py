import os
import subprocess

os.environ["PGPASSWORD"] = "bhanu1312"
pg_dump_path = r"C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"
dump_cmd = [
    pg_dump_path,
    "-U", "postgres",
    "-h", "localhost",
    "-d", "Hospital_booking",
    "--clean",
    "--if-exists",
    "--inserts"
]

try:
    result = subprocess.run(dump_cmd, capture_output=True, text=True, check=True, encoding='utf-8')
    sql_content = result.stdout
    
    # Filter out \restrict and other \ commands that might break Supabase
    filtered_lines = []
    for line in sql_content.splitlines():
        if not line.startswith("\\"):
            filtered_lines.append(line)
            
    with open(r"d:\hosiptal\supabase_ready.sql", "w", encoding="utf-8") as f:
        f.write("\n".join(filtered_lines))
        
    print("Successfully created supabase_ready.sql")
except Exception as e:
    print(f"Error: {e}")
