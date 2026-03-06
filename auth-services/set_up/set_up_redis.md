1. docker pull redis (only the first time)
2. docker run -d -p 6379:6379 --name redis-server redis (only the first time)
3. docker start redis-server (second time onwards)