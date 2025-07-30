import os

# Define paths
app_folder = r"C:\Users\shop\global-batteries-dashboard\app"
output_file = r"C:\Users\shop\global-batteries-dashboard\app_structure.txt"

# Extensions to merge code from
code_extensions = {".js", ".ts", ".tsx"}

# Create the output
with open(output_file, "w", encoding="utf-8") as out:
    for root, dirs, files in os.walk(app_folder):
        level = root.replace(app_folder, "").count(os.sep)
        indent = "│   " * level + "├── "
        out.write(f"{indent}{os.path.basename(root)}\\\n")

        for file in files:
            file_path = os.path.join(root, file)
            sub_indent = "│   " * (level + 1) + "├── "
            out.write(f"{sub_indent}{file}\n")

            # If it's a code file, append contents
            if os.path.splitext(file)[1] in code_extensions:
                out.write(f"\n{'-'*80}\n")
                out.write(f"Path: {file_path}\n")
                out.write(f"{'-'*80}\n")
                try:
                    with open(file_path, "r", encoding="utf-8") as code_file:
                        out.write(code_file.read() + "\n\n")
                except Exception as e:
                    out.write(f"[Error reading file: {e}]\n\n")
