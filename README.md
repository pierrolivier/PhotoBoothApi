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
If you want, you can enable other origins editing the `allowed_origins` value in `config/config.json`

```js
allowed_origins = ['cnn.com', 'onefootball.com'];
```

## Config

### Cache

You can use amazon s3 bucket to cache your images, so phantomJS has less work to do. To do so,
make sure `aws_cache.use` is set to `true` and that you specify bucket name in `config/config.json`.

We use credentials file to set up our amazon bucket keys. 
Alternatively, you can setup environment variables, they will be picked up automatically. 

Read more about it [here] (http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html). 

If you do not want to use cache, just simply put `aws_cache.use` to `false`;

### Allowed origins 

As stated above, there is a config value named `allowed_origins`. Default behavior is to opt-out, so for every site you want to take screenshot of, you have to
specify it in `allowed_origins`.

```js
allowed_origins = ['cnn.com', 'onefootball.com'];
```

## Endpoints

### Screenshot

```
/api/screenshot/:url
```

where `url` is a url to the page you want to render. Url has to be encoded when passed in.

This endpoint additionally accepts parameters, which determine the viewport size. `w` is param for *width* and `h` will determine *height*. If not passed in, default size will be 800x600.

`/api/screenshot/http://www.onefootball.com/?w=640&h=480`

