#!/bin/bash
set -x

cd public
git init
git remote add deploy "blog-deploy@huajingkun.com:/home/blog-deploy/blog.git"
git config user.name "Travis CI"
git config user.email "hjkcai+travisCI@gmail.com"
git add .
git commit -m "deploy"
git push --force deploy master
