Hacking
=======

Want to give it a shot locally? Great!

Dependencies:

- [TypeSafe activator](https://www.typesafe.com/get-started)
- Postgresql
- Redis

Services:

- [Cloudinary](http://cloudinary.com/): Simple CDN, used for file uploads
- [Google API Account](https://console.developers.google.com/project): Used by SecureSocial to authenticate users via Google account

Configuration
-------------

### Docker

```
$ docker run --name vocities-redis -d redis -p 6379:6379
$ docker run --name vocities-postgres -e POSTGRES_PASSWORD= -p 5432:5432 -d postgres
```

### Postgresql

```
> create database "vocities";
> create user vocities encrypted password 'seiticov';
```

These are the hardocded development defaults. If you'd prefer to configure it some other way, that's fine too, just stick

```
db.default.url="postgres://vocities:seiticov@localhost:5432/vocities"
```

with your different credentials in `conf/application.dev.conf`.

### Cloudinary "Direct Upload" (taken from the [Direct Upload Tutorial](http://cloudinary.com/blog/direct_upload_made_easy_from_browser_or_mobile_app_to_the_cloud)):

- At the bottom of the [Upload Settings](https://cloudinary.com/console/settings/upload), you'll find an "Upload presets" section.
- Add a new preset, with a mode of "Unsigned".
- This will probably change in the future as things improve.

### Google API Account

- Create a new project in the [Google API Console](https://console.developers.google.com/project)
- Inside the settings for that project, click "Credentials" on the left (under "APIs & auth")
- Click "Create new Client ID"

### `conf/application.dev.conf`:

- Go into the [Google Console](https://console.developers.google.com/project) for your project.
- Go into the "Credentials" section
- From the "Client ID for web application", note down the "Client ID" and "Client secret"

- Go into the [Cloudinary Account Settings](https://cloudinary.com/console/settings/account)
- From the bottom of the page, note down the "Cloudinary cloud name"
- Go into the [Cloudinary Upload Settings](https://cloudinary.com/console/settings/upload)
- From the "Upload presets" section, note down the name of the Unsigned preset we created earlier

```
securesocial {
  google {
    clientId="Insert your Google Client ID"
    clientSecret="Insert your Google Client Secret"
  }
}

cloudinary {
  cloud_name="Insert your Cloudinary Cloud Name"
  upload_preset="Insert your Unsigned Cloudinary Preset"
}
```
