To start up MongoDB local host: Need to open 2 cmd>

    1)  Start up mongod (local server) and assign the path:
    "C:\Program Files\MongoDB\Server\4.4\bin\mongod.exe" --dbpath C:\Users\KL\Documents\MongoDBdata


    2) Starting Mongo client from cmd>db
        "C:\Program Files\MongoDB\Server\4.4\bin\mongo"
        > show dbs

        > use libraryApp

        > db.books.find().pretty
        > db.books.find()