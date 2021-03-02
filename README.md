# Impacta_Bot



Install JSON Server

npm install -g json-server
Create a db.json file with some data

{
  "posts": [
    { "id": 1, "title": "json-server", "author": "typicode" }
  ],
  "comments": [
    { "id": 1, "body": "some comment", "postId": 1 }
  ],
  "profile": { "name": "typicode" }
}
Start JSON Server

json-server --watch db.json