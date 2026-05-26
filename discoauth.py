"""
discoauth.py - A simple authentication system for the DiscoExplorer corpus search engine

Take an authentication request from the React front end, check the provided password against a master password,
and if valid, serve the requested JSON dataset from a protected directory on the server.
"""

# !/usr/bin/env python3
import os
import sys
import json
from urllib.parse import parse_qs
from pathlib import Path

# ==========================================
# --- CONFIGURATION ---
# ==========================================

# Absolute path to the directory containing your restricted JSON files
# Make sure your web server user (e.g., www-data/apache/httpd) has read access to this folder.
DATA_DIR = "/var/www/discoexplorer/data/"

# The master password required to access the datasets
MASTER_PASSWORD = "yourmasterpassword"


# ==========================================

def send_response(status_code, status_message, content_type="application/json", body=""):
    """Helper to send HTTP headers and body."""
    print(f"Status: {status_code} {status_message}")
    print(f"Content-Type: {content_type}")
    # Essential CORS headers so the frontend can communicate with this script
    print("Access-Control-Allow-Origin: *")
    print("Access-Control-Allow-Headers: Authorization")
    print()  # Blank line indicates end of headers

    if body:
        print(body)
    sys.exit(0)


def main():
    # 1. Handle CORS Preflight (OPTIONS request) sent by the browser
    if os.environ.get("REQUEST_METHOD") == "OPTIONS":
        send_response(204, "No Content")

    # 2. Check Authentication
    # Note: If using Apache, ensure 'CGIPassAuth On' is in your .htaccess or vhost config
    # otherwise Apache might strip the Authorization header before it reaches this script.
    auth_header = os.environ.get("HTTP_AUTHORIZATION", "")

    if not auth_header.startswith("Bearer "):
        send_response(401, "Unauthorized", body='{"error": "Missing or invalid Authorization header"}')

    provided_password = auth_header[len("Bearer "):].strip()

    if provided_password != MASTER_PASSWORD:
        send_response(403, "Forbidden", body='{"error": "Incorrect password"}')

    # 3. Get the requested dataset from the query string
    query_string = os.environ.get("QUERY_STRING", "")
    query_params = parse_qs(query_string)
    dataset_filename = query_params.get("dataset", [None])[0]

    if not dataset_filename:
        send_response(400, "Bad Request", body='{"error": "No dataset specified"}')

    # 4. Securely resolve the file path
    try:
        # Require .json extension
        if not dataset_filename.endswith('.json'):
            send_response(400, "Bad Request", body='{"error": "Invalid file type requested"}')

        # Use os.path.basename to strip any directory traversal attempts (e.g., ../../)
        safe_filename = os.path.basename(dataset_filename)
        file_path = Path(DATA_DIR) / safe_filename

        if not file_path.exists() or not file_path.is_file():
            send_response(404, "Not Found", body='{"error": "Dataset not found on server"}')

        # 5. Read and return the JSON file content
        with open(file_path, 'r', encoding='utf-8') as f:
            file_content = f.read()

        send_response(200, "OK", body=file_content)

    except Exception as e:
        # Catch unexpected file read errors (e.g., permissions issues)
        send_response(500, "Internal Server Error", body=json.dumps({"error": str(e)}))


if __name__ == "__main__":

    test = False

    if test:
        # Simulate an environment for testing
        os.environ["REQUEST_METHOD"] = "GET"
        os.environ["HTTP_AUTHORIZATION"] = "Bearer " + MASTER_PASSWORD
        os.environ["QUERY_STRING"] = "dataset=test_dataset.json"

        # print a test dataset in the data directory for testing
        test_data_path = Path(DATA_DIR) / "test_dataset.json"

        # print the header for browser
        print("Content-Type: application/json")
        print()  # Blank line indicates end of headers
        if not test_data_path.exists():
            with open(test_data_path, 'w', encoding='utf-8') as f:
                json.dump({"message": "This is a test dataset."}, f)
        with open(test_data_path, 'r', encoding='utf-8') as f:
            print(f.read())
    else:
        main()
