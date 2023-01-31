
# Strapi Label Case

A script that updates Strapi configuration, it converts collection list and edit metadata labels to label case. 


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`STRAPI_URL`

`STRAPI_ADMIN_EMAIL`

`STRAPI_ADMIN_PASSWORD`


## Run Locally

Clone the project

```bash
  git clone git@github.com:borisa99/strapi-label-case.git
```

Go to the project directory

```bash
  cd strapi-lable-case
```

Install dependencies

```bash
  yarn install
```

Start the script

```bash
  COLLECTION_TYPE_UID="your-collection-type-uid" node index.js
```

