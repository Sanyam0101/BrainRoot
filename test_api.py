import urllib.request
import json
import logging

try:
    login_data = json.dumps({"email": "errortest@example.com", "password": "test"}).encode()
    token_req = urllib.request.Request("http://localhost:8000/api/v1/auth/login", data=login_data, headers={"Content-Type": "application/json"})
    token_res = json.loads(urllib.request.urlopen(token_req).read())

    note_data = json.dumps({"content": "hello", "tags": ["hello"]}).encode()
    note_req = urllib.request.Request("http://localhost:8000/api/v1/notes/", data=note_data, headers={"Content-Type": "application/json", "Authorization": f"Bearer {token_res['access_token']}"})
    print("Sending Note Create...")
    res = urllib.request.urlopen(note_req)
    print(res.read())
except Exception as e:
    print("ERROR:")
    print(getattr(e, 'read', lambda: str(e))())
