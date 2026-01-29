import requests
import shutil

url = "https://upload.wikimedia.org/wikipedia/commons/e/e0/Ratan_Tata_photo.jpg"
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
}

response = requests.get(url, headers=headers, stream=True)
if response.status_code == 200:
    with open('public/juggernauts/ratan-tata.jpg', 'wb') as out_file:
        shutil.copyfileobj(response.raw, out_file)
    print("Download successful")
else:
    print(f"Download failed: {response.status_code}")
