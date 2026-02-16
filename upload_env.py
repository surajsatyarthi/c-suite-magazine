import os
import subprocess

def upload_env_vars():
    env_file = '.env.local'
    if not os.path.exists(env_file):
        print(f"Error: {env_file} not found")
        return

    with open(env_file, 'r') as f:
        lines = f.readlines()

    for line in lines:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        
        try:
            key, value = line.split('=', 1)
            key = key.strip()
            value = value.strip()
            
            # Remove quotes if present
            if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
                value = value[1:-1]

            print(f"Adding {key}...")
            # Use subprocess to pipe value to vercel env add
            # vercel env add <name> production < <input>
            # We add to 'production', 'preview', 'development' to be safe, or just production as requested.
            # Usually we want it everywhere.
            # The command `vercel env add NAME production` prompts for value? 
            # Actually `echo value | vercel env add NAME production` works?
            # Creating a process to handle stdin
            
            # Add for each environment individually
            targets = ['production', 'preview', 'development']
            
            for target in targets:
                print(f"Adding {key} to {target}...")
                process = subprocess.Popen(
                    ['vercel', 'env', 'add', key, target],
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                stdout, stderr = process.communicate(input=value)
                
                if process.returncode != 0:
                    if "already exists" in stderr:
                        print(f"  - {key} already exists in {target}")
                    else:
                        print(f"  - Error adding {key} to {target}: {stderr}")
                else:
                    print(f"  - {key} added to {target} successfully")

                
        except ValueError:
            continue

if __name__ == "__main__":
    upload_env_vars()
