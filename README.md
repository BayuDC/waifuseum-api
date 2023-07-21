# Waifuseum

![Banner](https://media.discordapp.net/attachments/946013429200723989/946013554472013884/banner.png)

![Version](https://img.shields.io/github/package-json/v/BayuDC/waifuseum?style=for-the-badge)
![Status](https://img.shields.io/website.svg?url=https://api.waifuseum.bayudc.fun&style=for-the-badge&label=Status)

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

#### 💡 How it works

1. User upload the picture file to the http endpoint
2. The program send the file to Discord server via discord bot
3. The program save the url(obtained from discord bot) to database

Very simple right?

#### 📦 How are they stored

The logic is album as channel then picture as message.

![Discord Server](https://media.discordapp.net/attachments/946013429200723989/1131976837522792569/image.png)

Join my discord server if you want to see it.
Here is the link: https://discord.gg/8sSfCNCXHW.

#### ⛔ Limitations

~~The main drawback of this API is the file size limitation. Due to
Discord rules, This API can't save files with size more than 8 mb.
_Server Boost_ is needed to increase the maximum file size limit.~~
The limit increased to 25mb now! It's more than enough to store 4K image files.

## 🔖 API Docs

Base URL: https://api.waifuseum.bayudc.fun

| Path                    | Method | Body or Query                            |
| ----------------------- | ------ | ---------------------------------------- |
| `/`                     | GET    | -                                        |
| `/pictures`             | GET    | `?full` `?filter` `?page` `?count`       |
| `/pictures/mine`        | GET    | `?full` `?filter` `?page` `?count`       |
| `/pictures/all`         | GET    | `?full` `?filter` `?page` `?count`       |
| `/pictures/<id>`        | GET    | -                                        |
| `/pictures`             | POST   | `{ file/fileUrl, album, source? }`       |
| `/pictures/<id>`        | PUT    | `{ file/fileUrl?, album?, source? }`     |
| `/pictures/<id>`        | DELETE | -                                        |
| `/albums`               | GET    | `?full` `?filter` `?page` `?count`       |
| `/albums/mine`          | GET    | `?full` `?filter` `?page` `?count`       |
| `/albums/all`           | GET    | `?full` `?filter` `?page` `?count`       |
| `/albums/<id>`          | GET    | -                                        |
| `/albums/<id>/pictures` | GET    | `?full` `?page` `?count`                 |
| `/albums`               | POST   | `{ name, slug?, private?, community? }`  |
| `/albums/<id>`          | PUT    | `{ name?, slug?, private?, community? }` |
| `/albums/<id>`          | DELETE | -                                        |
| `/auth`                 | GET    | -                                        |
| `/auth/me`              | GET    | -                                        |
| `/auth/login`           | POST   | `{ email, password }`                    |
| `/auth/logout`          | POST   | -                                        |
| `/profile`              | GET    | -                                        |
| `/profile/password`     | PATCH  | `{ oldPassword, newPassword }`           |
| `/users`                | GET    | `?full`                                  |
| `/users/<id>`           | GET    | -                                        |
| `/users`                | POST   | `{ name, email, password, abilities }`   |
| `/users/<id>`           | PUT    | `{ name?, email?, abilities? }`          |
| `/users/<id>`           | DELETE | -                                        |

Sorry i am too lazy to make Swagger UI.

## 🚧 Development

Requirements: A Discord bot that has **Worker** role in Waifuseum Discord server

```
$ git clone https://github.com/BayuDC/waifuseum.git
$ copy .env.example .env
$ pnpm install
$ pnpm dev
```
