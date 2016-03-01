Nodejs Authentication Project
======================

Example how to implement a authentication system with NodeJS and MongoDB.

For guidance check the related tutorial on http://devdactic.com/


Run
========

node server.js

MONGO
the default path: 
x/data/db



I need to FIND the default path for the data/db

we are using
~/data/db

default port 27017


BEFORE.. MongoDB was able to find the default path because it existed
'

MongoDB will look for the default path /data/db and try to run on port 27017 unless you instruct it to do otherwise

Because we could not find the default path..

mongod --dbpath ~/data/db
the mongoDB data path for the db is at

abelista => data => db => 