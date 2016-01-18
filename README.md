# PhotoBoothApi
Api for taking screenshots of websites


## Setup

You must install [node] (https://nodejs.org/en/) and [npm] (https://www.npmjs.com/) on machine you want to run api on.

Additionally, you must have phantomjs globally available. You can set it up by running:

```
npm install -g phantomjs
```

## Dependencies

```
npm install
```

## Running

```
node server.js
```

It's configured to reach only the _onefootball.com_ domain.
If you want, you can enable other origins editing the `ALLOWED_ORIGINS` variable in `service/phantomJs.js`

```js
var ALLOWED_ORIGINS = ['localhost', 'onefootball.com'];
```


## Endpoints

### Screenshot

```
/api/screenshot/:url
```

where `url` is a url to the page you want to render. Url has to be encoded when passed in.

This endpoint additionally accepts parameters, which determine the viewport size. `w` is param for *width* and `h` will determine *height*. If not passed in, default size will be 800x600.

`/api/screenshot/http://www.onefootball.com/?w=640&h=480`
