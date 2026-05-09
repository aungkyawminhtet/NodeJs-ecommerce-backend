#!/usr/bin/sh

echo "Starting post-update hook"
for refname in "$@"; do
    echo "refname: $refname"
  if [ "$refname" == "refs/heads/master" ]; then
    date = $(date +%F)
    git tag -a -f "release-$date" master -m "Release for $date"
  fi
done
echo "Post-update hook completed"
exit 0
