# Quick, Draw! icons

SVG icons generated from the [quickdraw dataset](https://github.com/googlecreativelab/quickdraw-dataset).

## I just want to see the icons

1. Clone repository
2. `yarn` or `npm install`
3. `npm run example`
4. Go to `localhost:8080`

## Legal advice

> "Can I use this in anything that pays money?"

I have no idea, please ask your lawyer. This is just a for-fun project, though I could imagine commercial use cases.

## Generate own icon set

This is a bit complicated.

### Download drawings


1. Sign up at Google if you haven't
2. [Install Google Cloud SDK](https://cloud.google.com/sdk/docs/)
3. Run `gsutil -m cp 'gs://quickdraw_dataset/full/simplified/*' drawings`
4. Wait, this downloads ~22 GB. Change the wildcard and play with `gsutil ls` if you don't want all of the drawings.

### Generate icons

1. Clone project
2. `yarn` or `npm i`
3. `npm run build`, this calls the CLI script in `./bin`. You can pass parameters after a double-dash like so: `npm run build -- --help`

### Look at icons

    npm run preview
    # preview available at localhost:8080
