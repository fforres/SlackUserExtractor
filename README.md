# SlackUserExtractor

Small tool for extracting slack users from a slack group and saving them to a mondodb database

## Installation

* [x] clone
* [x] yarn install
* [x] Add .env variables `SLACK_API_TOKEN` `MONGODB_URL` `MONGODB_DATABASE` `MONGODB_USERS_COLLECTION`
* [x] yarn start

## Function times

```
getSlackMembers: 562.702ms
getDatabaseMembers: 10532.868ms
getSlackMembersToAdd: 0.367ms
insertSlackMembers: 0.063ms
FullInsertTime: 11100.418ms
getDatabaseMembers: 1175.521ms
enqueueFetchImages: 9.259ms
FullDownloadTime: 20391.354ms
getFilesToTransform: 222.923ms
enqueueTransformImages: 3.788ms
fullTransformTime: 11346.892ms
fullExecutionTime: 69465.526ms
```