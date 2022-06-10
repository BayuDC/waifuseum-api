# Waifuseum

![Banner](https://media.discordapp.net/attachments/946013429200723989/946013554472013884/banner.png)

![Version](https://img.shields.io/github/package-json/v/BayuDC/waifuseum?style=for-the-badge)
![Status](https://img.shields.io/website.svg?url=https://waifuseum.herokuapp.com&style=for-the-badge&label=Status)

Waifuseum (Museum Waifu) is a simple REST API for storing and managing
anime picture collection. This project use combinaton of ExpressJS,
Discord.js, and MongoDB. This uses Discord server as a place to store
picture file and MongoDB to save the picture url. When we upload a file
to discord server, we can right click the message and get the file url
then we can save the file url in a database, and yeah **free cloud
storage to store picture file**. So, I made this project to automate
it. Btw, this project is inspired by
[Waifu.pics](https://github.com/Waifu-pics/waifu-api) and
[Nekos.life](https://github.com/Nekos-life/nekos-dot-life).

#### ⚙️ How it works

1. User upload the picture file to the http endpoint
2. This thing send the file to Discord server via discord bot
3. This thing save the url(obtained from discord bot) to database

#### ⛔ Limitations

The main drawback of this API is the file size limitation. Due to
Discord rules, This API can't save files with size more than 8 mb.
_Server Boost_ is needed to increase the maximum file size limit.

## 🔖 Endpoints

Base url: https://api.waifuseum.my.id

| Path             | Method | Body or Query                              |
| ---------------- | ------ | ------------------------------------------ |
| `/`              | GET    | -                                          |
| `/pictures`      | GET    | `?count` `?full` `?album`                  |
| `/pictures/all`  | GET    | `?count` `?full ` `?album` `?page`         |
| `/pictures/<id>` | GET    | -                                          |
| `/pictures`      | POST   | `{ file/fileUrl, album, source? }`         |
| `/pictures/<id>` | PUT    | `{ file/fileUrl?, album?, source? }`       |
| `/pictures/<id>` | DELETE | -                                          |
| `/albums`        | GET    | -                                          |
| `/albums/<id>`   | GET    | -                                          |
| `/albums`        | POST   | `{ name, slug? }`                          |
| `/albums/<id>`   | PUT    | `{ name?, slug? }`                         |
| `/albums/<id>`   | DELETE | -                                          |
| `/auth`          | GET    | -                                          |
| `/auth/me`       | GET    | -                                          |
| `/auth/login`    | POST   | `{ email, password }`                      |
| `/auth/logout`   | POST   | -                                          |
| `/users`         | GET    | `?full`                                    |
| `/users/<id>`    | GET    | -                                          |
| `/users`         | POST   | `{ name, email, password, abilities }`     |
| `/users/<id>`    | PUT    | `{ name?, email?, password?, abilities? }` |
| `/users/<id>`    | DELETE | -                                          |
