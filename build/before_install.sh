#!/bin/bash
set -x

openssl aes-256-cbc -K $encrypted_0e425c9ccbd3_key -iv $encrypted_0e425c9ccbd3_iv -in deploy-key.enc -out deploy-key -d
rm deploy-key.enc
chmod 600 deploy-key
mv deploy-key ~/.ssh/id_rsa
mv deploy-key.pub ~/.ssh/id_rsa.pub
