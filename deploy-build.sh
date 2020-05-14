rm -rf production
yarn build
mkdir production
cd production
git clone git@bitbucket.org:cobianzo/kings-react-build.git .
rm -rf *
mv -f ../build/* ./
git add --all
git commit -m "prod"
git push
cd ..