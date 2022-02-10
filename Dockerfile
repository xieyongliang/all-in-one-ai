From node:16
 
RUN mkdir -p /usr/src/app
WORKDIR /user/src/app
 
COPY . /user/src/app

RUN curl -o- -L https://yarnpkg.com/install.sh | bash
RUN $HOME/.yarn/bin/yarn install
RUN npm install -g webpack && npm install && yarn build
 
EXPOSE 3000
 
CMD ["node","run.js"]
